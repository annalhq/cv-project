import cv2
import numpy as np


def _apply_gaussian_blur(image: np.ndarray, ksize: int) -> np.ndarray:
    return cv2.GaussianBlur(image, (ksize, ksize), 0)


def _compute_gradients(image: np.ndarray):
    Ix = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
    Iy = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
    return Ix, Iy


def _compute_harris_response(Ix, Iy, alpha: float, win: int) -> np.ndarray:
    Ixx, Ixy, Iyy = Ix ** 2, Ix * Iy, Iy ** 2
    kernel = np.ones((win, win), dtype=np.float32)
    Sxx = cv2.filter2D(Ixx, -1, kernel)
    Sxy = cv2.filter2D(Ixy, -1, kernel)
    Syy = cv2.filter2D(Iyy, -1, kernel)
    det = (Sxx * Syy) - (Sxy ** 2)
    trace = Sxx + Syy
    return det - alpha * (trace ** 2)


def _identify_corners(R: np.ndarray, threshold: float) -> np.ndarray:
    corners = np.zeros_like(R, dtype=np.uint8)
    corners[R > threshold * np.max(R)] = 255
    return corners


def _non_maximal_suppression(corners: np.ndarray, win: int) -> np.ndarray:
    half = win // 2
    out = corners.copy()
    for i in range(half, corners.shape[0] - half):
        for j in range(half, corners.shape[1] - half):
            if corners[i, j] == 255:
                patch = corners[i - half:i + half + 1, j - half:j + half + 1]
                if np.max(patch) != 255:
                    out[i, j] = 0
    return out


def _draw_corners(image: np.ndarray, corners: np.ndarray, offset: int) -> np.ndarray:
    vis = image.copy()
    h, w = vis.shape[:2]
    for y in range(offset, h - offset):
        for x in range(offset, w - offset):
            if corners[y, x] == 255:
                cv2.circle(vis, (x, y), 5, (0, 0, 255), -1)
    return vis


def harris_corner_detector(
    image: np.ndarray,
    gauss_k: int = 3,
    alpha: float = 0.04,
    threshold: float = 0.30,
    nhood: int = 5,
    nms: bool = True,
) -> tuple[np.ndarray, np.ndarray]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    smooth = _apply_gaussian_blur(gray, gauss_k)
    Ix, Iy = _compute_gradients(smooth)
    R = _compute_harris_response(Ix, Iy, alpha, nhood)
    corners = _identify_corners(R, threshold)
    if nms:
        corners = _non_maximal_suppression(corners, nhood)
    vis = _draw_corners(image, corners, nhood // 2)
    return vis, corners
