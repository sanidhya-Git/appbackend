"""
Mock face service for development/testing.
Returns realistic-looking face embeddings without requiring insightface/GPU.
Replace with main.py (real service) for production.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import math
import hashlib
import base64
from typing import List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Face Recognition Service (Mock)", version="1.0.0-mock")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EMBEDDING_DIM = 512


def generate_embedding(seed: str) -> List[float]:
    """Generate a deterministic normalized embedding from a seed string."""
    h = hashlib.sha256(seed.encode()).digest()
    random.seed(h)
    raw = [random.gauss(0, 1) for _ in range(EMBEDDING_DIM)]
    norm = math.sqrt(sum(x * x for x in raw))
    return [x / norm for x in raw]


def image_fingerprint(data: str) -> str:
    return hashlib.md5(data[:500].encode()).hexdigest()


class EmbeddingRequest(BaseModel):
    image: str


class UrlRequest(BaseModel):
    url: str


class FaceResult(BaseModel):
    embedding: List[float]
    quality: float
    bbox: dict


@app.post("/extract-embedding", response_model=FaceResult)
async def extract_embedding(request: EmbeddingRequest):
    if len(request.image) < 100:
        raise HTTPException(status_code=400, detail="No face detected in image")

    fp = image_fingerprint(request.image)
    embedding = generate_embedding(fp)
    quality = 0.75 + random.uniform(0, 0.2)

    logger.info(f"extract-embedding: quality={quality:.2f}")
    return FaceResult(
        embedding=embedding,
        quality=quality,
        bbox={"x": 80.0, "y": 60.0, "width": 160.0, "height": 200.0},
    )


@app.post("/extract-embeddings-url", response_model=List[FaceResult])
async def extract_embeddings_url(request: UrlRequest):
    fp = image_fingerprint(request.url)
    results = []

    # Simulate 0-2 faces per photo (biased toward 1)
    seed_val = int(fp[:8], 16)
    random.seed(seed_val)
    face_count = random.choices([0, 1, 2], weights=[20, 65, 15])[0]

    for i in range(face_count):
        embedding = generate_embedding(f"{fp}_face_{i}")
        quality = 0.65 + random.uniform(0, 0.3)
        results.append(
            FaceResult(
                embedding=embedding,
                quality=quality,
                bbox={
                    "x": float(50 + i * 120),
                    "y": 40.0,
                    "width": 100.0,
                    "height": 130.0,
                },
            )
        )

    logger.info(f"extract-embeddings-url: {face_count} faces from {request.url[:60]}")
    return results


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": True, "mode": "mock"}
