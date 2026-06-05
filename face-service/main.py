from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import insightface
from insightface.app import FaceAnalysis
import numpy as np
import cv2
import base64
import httpx
import asyncio
from typing import List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Face Recognition Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

face_app: Optional[FaceAnalysis] = None


@app.on_event("startup")
async def startup():
    global face_app
    logger.info("Loading InsightFace model...")
    face_app = FaceAnalysis(
        name="buffalo_l",
        allowed_modules=["detection", "recognition"],
        providers=["CPUExecutionProvider"],
    )
    face_app.prepare(ctx_id=0, det_size=(640, 640))
    logger.info("InsightFace model loaded successfully")


class EmbeddingRequest(BaseModel):
    image: str  # base64 encoded


class UrlRequest(BaseModel):
    url: str


class FaceResult(BaseModel):
    embedding: List[float]
    quality: float
    bbox: dict


def decode_base64_image(b64_string: str) -> np.ndarray:
    if "," in b64_string:
        b64_string = b64_string.split(",")[1]
    img_bytes = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image")
    return img


def compute_face_quality(face) -> float:
    """Estimate face quality based on detection confidence and size."""
    det_score = float(face.det_score)
    bbox = face.bbox
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    size_score = min(1.0, (width * height) / (100 * 100))
    return min(1.0, (det_score * 0.7) + (size_score * 0.3))


def extract_faces_from_image(img: np.ndarray) -> List[FaceResult]:
    if face_app is None:
        raise RuntimeError("Face model not loaded")

    faces = face_app.get(img)
    results = []

    for face in faces:
        if face.normed_embedding is None:
            continue

        quality = compute_face_quality(face)
        bbox = face.bbox

        results.append(
            FaceResult(
                embedding=face.normed_embedding.tolist(),
                quality=quality,
                bbox={
                    "x": float(bbox[0]),
                    "y": float(bbox[1]),
                    "width": float(bbox[2] - bbox[0]),
                    "height": float(bbox[3] - bbox[1]),
                },
            )
        )

    return results


@app.post("/extract-embedding", response_model=FaceResult)
async def extract_embedding(request: EmbeddingRequest):
    try:
        img = decode_base64_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    faces = extract_faces_from_image(img)

    if not faces:
        raise HTTPException(status_code=400, detail="No face detected in image")

    if len(faces) > 1:
        raise HTTPException(
            status_code=400,
            detail="Multiple faces detected. Please ensure only your face is visible.",
        )

    return faces[0]


@app.post("/extract-embeddings-url", response_model=List[FaceResult])
async def extract_embeddings_url(request: UrlRequest):
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(request.url)
            response.raise_for_status()

        nparr = np.frombuffer(response.content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return []

        return extract_faces_from_image(img)

    except Exception as e:
        logger.error(f"Failed to extract from URL {request.url}: {e}")
        return []


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": face_app is not None,
    }
