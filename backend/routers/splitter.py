"""API router for the image splitter utility."""

import uuid

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from services.image_utils import read_upload
from services.splitter import split_image

router = APIRouter()


@router.post("/run")
async def run_splitter(
    image: UploadFile = File(...),
    chunks: int = Form(4),
    direction: str = Form("vertical"),
    overlap_ratio: float = Form(0.2),
):
    """
    Accept a single image upload and split configuration.
    Returns a JSON response with metadata and URLs for each chunk.
    """
    # Validate inputs
    if chunks < 2 or chunks > 20:
        raise HTTPException(status_code=400, detail="chunks must be between 2 and 20.")
    if direction not in ("vertical", "horizontal"):
        raise HTTPException(status_code=400, detail="direction must be 'vertical' or 'horizontal'.")
    if not (0 <= overlap_ratio < 1):
        raise HTTPException(status_code=400, detail="overlap_ratio must be between 0 and 1.")

    # Decode image
    raw = await image.read()
    try:
        img = read_upload(raw)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Could not decode {image.filename}")

    session_id = uuid.uuid4().hex[:12]

    # Run the split
    try:
        result_chunks = split_image(img, chunks, direction, overlap_ratio, session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "session_id": session_id,
        "source": {
            "filename": image.filename,
            "width": img.shape[1],
            "height": img.shape[0],
        },
        "config": {
            "chunks": chunks,
            "direction": direction,
            "overlap_ratio": overlap_ratio,
        },
        "results": result_chunks,
    }
