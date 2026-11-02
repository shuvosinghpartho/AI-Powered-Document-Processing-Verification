from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db

# Import all API endpoints from the architecture diagram
from app.api.upload import router as upload_router
from app.api.status import router as status_router
from app.api.results import router as results_router
from app.api.search import router as search_router
from app.api.correction import router as correction_router
from app.api.reprocess import router as reprocess_router
from app.api.cross_verify import router as cross_verify_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed initial documents
    init_db()
    print(f"[{settings.PROJECT_NAME}] Database initialized at {settings.DB_PATH}")

    # Warm up EasyOCR Reader for instant OCR inference
    try:
        from app.pipeline.stage2_extractor import get_easyocr_reader
        reader = get_easyocr_reader()
        if reader:
            print("[EasyOCR Engine] Warmed up and ready for instant inference.")
    except Exception as e:
        print(f"[EasyOCR Warmup] {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Document Intelligence & Verification System powered by FastAPI, PyMuPDF, EasyOCR, Gemini 2.5 Flash, and SQLite.",
    lifespan=lifespan
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(upload_router, prefix=settings.API_PREFIX)
app.include_router(status_router, prefix=settings.API_PREFIX)
app.include_router(results_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(correction_router, prefix=settings.API_PREFIX)
app.include_router(reprocess_router, prefix=settings.API_PREFIX)
app.include_router(cross_verify_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "gemini_model": settings.GEMINI_MODEL
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

