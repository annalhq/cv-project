"""Image splitting service — splits a single image into overlapping chunks.

Ported from test/utils/main.py to work as a reusable service layer.
Uses OpenCV for image decoding/encoding and numpy for array slicing.
"""

import os
import uuid

import cv2
import numpy as np

from services.image_utils import save_image


def split_image(
    img: np.ndarray,
    chunks: int,
    direction: str,
    overlap_ratio: float,
    session_id: str,
) -> list[dict]:
    """
    Split a single image into `chunks` pieces along the given direction.

    Args:
        img:           BGR numpy image (decoded from upload).
        chunks:        Number of pieces to split into (>= 2).
        direction:     "vertical" (columns, left→right) or "horizontal" (rows, top→bottom).
        overlap_ratio: Float in [0, 1) — fraction of overlap between adjacent chunks.
        session_id:    Unique session ID used for saving output files.

    Returns:
        List of dicts, each with:
          - index:    chunk index (0-based)
          - filename: chunk filename
          - url:      URL path to the saved image (relative to static mount)
          - width:    chunk pixel width
          - height:   chunk pixel height
    """
    if not (0 <= overlap_ratio < 1):
        raise ValueError("overlap_ratio must be between 0 (inclusive) and 1 (exclusive)")
    if chunks < 2:
        raise ValueError("chunks must be at least 2")
    if direction not in ("vertical", "horizontal"):
        raise ValueError("direction must be 'vertical' or 'horizontal'")

    height, width = img.shape[:2]
    results: list[dict] = []

    if direction == "vertical":
        step = width // chunks
        overlap = int(step * overlap_ratio)

        for i in range(chunks):
            left = max(0, i * step - overlap)
            right = min(width, (i + 1) * step + overlap)
            crop = img[:, left:right]

            url = save_image(crop, session_id, f"chunk_{i}")
            results.append({
                "index": i,
                "filename": f"chunk_{i}.png",
                "url": url,
                "width": crop.shape[1],
                "height": crop.shape[0],
            })

    else:  # horizontal
        step = height // chunks
        overlap = int(step * overlap_ratio)

        for i in range(chunks):
            top = max(0, i * step - overlap)
            bottom = min(height, (i + 1) * step + overlap)
            crop = img[top:bottom, :]

            url = save_image(crop, session_id, f"chunk_{i}")
            results.append({
                "index": i,
                "filename": f"chunk_{i}.png",
                "url": url,
                "width": crop.shape[1],
                "height": crop.shape[0],
            })

    return results
