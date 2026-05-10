from typing import Generator

import numpy as np

from services.image_utils import save_image

from .harris import harris_corner_detector
from .homography import ransac_homography
from .matching import sift_feature_matching
from .stitching import stitch_images
from .types import StepDict


def run_pipeline(images: list[np.ndarray], session_id: str) -> Generator[StepDict, None, None]:
    if len(images) < 2:
        raise ValueError("Need at least 2 images")

    load_urls = [save_image(img, session_id, f"input_{i}") for i, img in enumerate(images)]
    yield {
        "step": 0,
        "name": "Image Load",
        "description": f"Loaded {len(images)} input images.",
        "images": load_urls,
        "metadata": {
            "count": len(images),
            "resolutions": [f"{img.shape[1]}×{img.shape[0]}" for img in images],
        },
        "session_id": session_id,
    }

    result = images[0]

    for i in range(1, len(images)):
        img_left = result
        img_right = images[i]

        vis_left, _ = harris_corner_detector(img_left)
        vis_right, _ = harris_corner_detector(img_right)
        urls = [
            save_image(vis_left, session_id, f"harris_left_{i}"),
            save_image(vis_right, session_id, f"harris_right_{i}"),
        ]
        yield {
            "step": 1,
            "name": "Harris Corner Detection",
            "algorithm": "Harris + NMS",
            "description": f"Detected corners on pair {i}/{len(images)-1}.",
            "images": urls,
            "metadata": {"pair": f"{i}/{len(images)-1}", "threshold": 0.30},
            "session_id": session_id,
        }

        src_pts, dst_pts, match_vis, n_good = sift_feature_matching(img_left, img_right)
        match_url = save_image(match_vis, session_id, f"matches_{i}")
        yield {
            "step": 2,
            "name": "Feature Matching",
            "algorithm": "SIFT + BFMatcher",
            "description": f"Found {n_good} good matches after Lowe's ratio test.",
            "images": [match_url],
            "metadata": {"good_matches": n_good, "ratio_threshold": 0.75},
            "session_id": session_id,
        }

        H, inlier_count = ransac_homography(src_pts, dst_pts, threshold=0.5)
        if H is None:
            raise RuntimeError(f"Homography estimation failed for pair {i}")
        yield {
            "step": 3,
            "name": "RANSAC Homography",
            "algorithm": "RANSAC (2000 iters)",
            "description": f"Estimated homography with {inlier_count} inliers.",
            "images": [],
            "metadata": {
                "inliers": inlier_count,
                "iterations": 2000,
                "homography": H.tolist(),
            },
            "session_id": session_id,
        }

        result = stitch_images(img_left, img_right, H)
        stitch_url = save_image(result, session_id, f"stitch_{i}")
        yield {
            "step": 4,
            "name": "Warping & Stitching",
            "algorithm": "Perspective Warp",
            "description": f"Stitched pair {i}/{len(images)-1} into panorama.",
            "images": [stitch_url],
            "metadata": {
                "output_size": f"{result.shape[1]}×{result.shape[0]}",
                "pair": f"{i}/{len(images)-1}",
            },
            "session_id": session_id,
        }

    final_url = save_image(result, session_id, "final_panorama")
    yield {
        "event": "complete",
        "final_panorama": final_url,
        "elapsed_seconds": 0,
        "session_id": session_id,
    }
