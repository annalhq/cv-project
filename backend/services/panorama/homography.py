import cv2
import numpy as np


def ransac_homography(
    src_pts: np.ndarray,
    dst_pts: np.ndarray,
    iterations: int = 2000,
    threshold: float = 4.0,
) -> tuple[np.ndarray | None, int]:
    best_H = None
    max_inliers = 0

    for _ in range(iterations):
        idx = np.random.choice(len(src_pts), 4, replace=False)
        H, _ = cv2.findHomography(src_pts[idx], dst_pts[idx], cv2.RANSAC, threshold)
        if H is None:
            continue

        transformed = cv2.perspectiveTransform(src_pts, H)
        dists = np.linalg.norm(transformed - dst_pts, axis=2)
        inliers = int(np.sum(dists < threshold))

        if inliers > max_inliers:
            max_inliers = inliers
            best_H = H

    return best_H, max_inliers
