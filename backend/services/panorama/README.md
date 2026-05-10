# Panorama Pipeline Context

 panorama-stitching implementation used by the backend SSE endpoint. The code is organized as a small pipeline of focused algorithms rather than a single monolithic script.

## Purpose

The pipeline accepts 2 or more overlapping BGR images, processes them left-to-right, and emits a stream of step objects that the frontend renders in real time. Each step includes:

- a numeric stage index
- a human-readable name and description
- optional algorithm label
- one or more image URLs saved under the session output directory
- metadata that explains the current stage
- a `session_id` used to group generated files

The final event exposes the stitched panorama URL and the elapsed pipeline time.

## High-Level Flow

The processing order is:

1. Load and persist the input images.
2. Detect corners on the current panorama and the next image with Harris corner detection.
3. Extract SIFT features and match them with a brute-force matcher plus Lowe's ratio test.
4. Estimate a robust homography with a custom RANSAC loop.
5. Warp the current panorama into the next image frame and composite both images into a larger canvas.
6. Repeat the process until all images are merged.

The pipeline is iterative. After each stitch, the resulting panorama becomes the left-hand image for the next pair.

## Module Map

- `harris.py` implements Harris corner detection and optional non-maximum suppression.
- `matching.py` implements SIFT keypoint extraction and descriptor matching.
- `homography.py` implements random-sample-consensus homography estimation.
- `stitching.py` warps the first image with the homography and composites the second image onto the canvas.
- `pipeline.py` orchestrates the full sequence and yields SSE-ready step dictionaries.
- `types.py` defines the shared `StepDict` alias used by the generator.
- `__init__.py` re-exports the public functions for `services.panorama` imports.

## Harris Corner Detection

`harris_corner_detector(image, gauss_k=3, alpha=0.04, threshold=0.30, nhood=5, nms=True)` performs the classical Harris corner pipeline:

1. Convert the image to grayscale.
2. Apply Gaussian blur to reduce noise.
3. Compute image gradients with Sobel filters.
4. Build the Harris response matrix `R = det(M) - alpha * trace(M)^2` where `M` is the local second-moment matrix.
5. Threshold responses relative to the global maximum.
6. Optionally suppress non-maximal responses in a local neighborhood.
7. Draw red circles on the original image for visualization.

Important details:

- The implementation is intentionally simple and uses OpenCV primitives directly.
- Thresholding is relative, so the number of detected corners depends on image contrast.
- The returned `corners` array is a binary mask, while `vis` is only for display.

## SIFT Matching

`sift_feature_matching(img1, img2)` is the correspondence stage.

1. Convert both images to grayscale.
2. Detect SIFT keypoints and compute descriptors.
3. Use `cv2.BFMatcher()` with k-nearest-neighbor matching (`k=2`).
4. Apply Lowe's ratio test: accept a match only if `m.distance < 0.75 * n.distance`.
5. Draw the accepted matches for debugging and UI display.
6. Convert accepted keypoints into source and destination point arrays.

Outputs:

- `src_pts`: matched points from the left image / current panorama
- `dst_pts`: matched points from the right image / next input image
- `match_img`: visualization of retained matches
- `len(good)`: the count of accepted matches

Important details:

- This function assumes SIFT is available in the OpenCV build.
- If descriptor detection fails on a very poor image pair, later steps may fail because the downstream code expects enough correspondences to estimate a homography.

## RANSAC Homography

`ransac_homography(src_pts, dst_pts, iterations=2000, threshold=4.0)` estimates a 3x3 projective transform that maps the left image into the right image frame.

Core loop:

1. Randomly sample 4 correspondences, which is the minimum for a planar homography.
2. Call `cv2.findHomography` on the sampled points.
3. Skip the iteration if OpenCV cannot compute a valid matrix.
4. Transform all source points with the candidate homography.
5. Measure Euclidean distances between transformed source points and destination points.
6. Count inliers as points whose reprojection error is below the threshold.
7. Keep the homography with the largest inlier count.

Outputs:

- `best_H`: the best homography found, or `None` if no valid model was found
- `max_inliers`: inlier count for the best model

Important details:

- This is a custom RANSAC loop, not just a wrapper around OpenCV's RANSAC mode.
- The function uses a fixed random sampling strategy and does not refine the best model after selection.
- `pipeline.py` passes `threshold=0.5`, which is much stricter than the default argument and is the real runtime setting.

## Stitching and Warping

`stitch_images(img1, img2, H)` creates the panorama canvas.

1. Compute the four corners of `img1`.
2. Transform those corners through the homography to determine the warped extent.
3. Build a translation matrix so negative coordinates are shifted into positive canvas space.
4. Warp `img1` using `cv2.warpPerspective(img1, T @ H, ...)`.
5. Compute the overlap region where `img2` should be copied into the output.
6. Copy pixels from `img2` into empty locations of the warped image.

Important details:

- The canvas is sized large enough to hold both the warped panorama and the second image.
- The compositing rule is simple: only pixels where the warped image is black are replaced by pixels from `img2`.
- There is no seam finding, exposure compensation, multi-band blending, or photometric normalization.
- Because of the simple mask-based copy, visible seams are expected on difficult image pairs.

## Pipeline Orchestration

`run_pipeline(images, session_id)` is the main generator consumed by the API router.

Behavior:

1. Reject input with fewer than 2 images.
2. Save all input images under the session directory using `save_image`.
3. Yield an `Image Load` step with the saved input URLs and image dimensions.
4. Initialize `result = images[0]`.
5. For each remaining image:
   - Run Harris detection on the current panorama and the next image.
   - Run SIFT matching and save the match visualization.
   - Estimate homography with RANSAC.
   - Warp and stitch the current panorama with the next image.
   - Save and yield the intermediate stitched panorama.
6. Save the final panorama and yield a terminal `complete` event.

The generator is designed for streaming: each `yield` becomes one SSE payload.

## Runtime Contract With the Router

`backend/routers/stitch.py` reads uploaded files, decodes them to numpy arrays, generates a `session_id`, and streams the output of `run_pipeline` as Server-Sent Events.

The router also injects the elapsed runtime into the `complete` event before sending it to the client.

This means the pipeline itself owns the algorithmic work, while the router owns transport and timing.

## Runtime Contract With the Frontend

The frontend expects the payload shape defined in `frontend/app/components/pipeline/types.ts`:

- normal step objects with `step`, `name`, `description`, `images`, `metadata`, optional `algorithm`, and optional `session_id`
- a `complete` event containing `final_panorama`, `elapsed_seconds`, and `session_id`
- an `error` event containing `detail`

The UI appends the API base URL to any returned relative image path.

## Saved Artifacts

`services.image_utils.save_image` writes files to `backend/outputs/<session_id>/` and returns a URL path of the form `/outputs/<session_id>/<filename>.png`.

Generated artifacts include:

- raw input images
- Harris visualizations for each image pair
- SIFT match visualizations
- intermediate stitched panoramas
- the final panorama

## Important Caveats

- `backend/services/panorama.py` contains an older monolithic implementation of the same pipeline. The package version in this folder is the active one imported by the router.
- The current stitcher only handles pairwise left-to-right accumulation, so it is not a full graph-based panorama system.
- The homography model assumes the scene is approximately planar or the camera motion is close to pure rotation.
- The code favors clarity and visualization over robustness and blending quality.

## Mental Model For Another Agent

Treat the pipeline as four separable algorithmic stages wrapped in a streaming generator:

- local structure detection with Harris
- correspondence estimation with SIFT + ratio test
- model fitting with custom RANSAC homography selection
- geometric warping and naive compositing

If you need to modify behavior, change the smallest stage that owns that responsibility instead of editing the generator end-to-end.
