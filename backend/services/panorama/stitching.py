import cv2
import numpy as np


def stitch_images(img1: np.ndarray, img2: np.ndarray, H: np.ndarray) -> np.ndarray:
    h1, w1 = img1.shape[:2]
    h2, w2 = img2.shape[:2]

    pts = np.float32([[0, 0], [0, h1], [w1, h1], [w1, 0]]).reshape(-1, 1, 2)
    transformed = cv2.perspectiveTransform(pts, H)

    x_min, x_max = int(np.min(transformed[:, 0, 0])), int(np.max(transformed[:, 0, 0]))
    y_min, y_max = int(np.min(transformed[:, 0, 1])), int(np.max(transformed[:, 0, 1]))

    tx = -x_min if x_min < 0 else 0
    ty = -y_min if y_min < 0 else 0

    out_w = max(x_max - x_min, w2 + tx)
    out_h = max(y_max - y_min, h2 + ty)

    T = np.array([[1, 0, tx], [0, 1, ty], [0, 0, 1]], dtype=np.float64)
    warped = cv2.warpPerspective(img1, T @ H, (out_w, out_h))

    y_start, y_end = max(ty, 0), min(ty + h2, out_h)
    x_start, x_end = max(tx, 0), min(tx + w2, out_w)
    roi_y1, roi_x1 = max(-ty, 0), max(-tx, 0)
    roi_y2 = roi_y1 + (y_end - y_start)
    roi_x2 = roi_x1 + (x_end - x_start)

    mask = warped[y_start:y_end, x_start:x_end].sum(axis=2) == 0
    warped[y_start:y_end, x_start:x_end][mask] = img2[roi_y1:roi_y2, roi_x1:roi_x2][mask]

    return warped
