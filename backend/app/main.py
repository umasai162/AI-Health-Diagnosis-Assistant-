"""
FastAPI Application Entry Point
Sets up CORS, routers, lifespan events, and global error handling.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, UPLOAD_DIR
from app.database import Base, engine

# ──────────────────────────────────────────────
# Import all models so SQLAlchemy creates tables
# ──────────────────────────────────────────────
from app.models.user import User            # noqa: F401
from app.models.report import Report        # noqa: F401
from app.models.analysis import Analysis    # noqa: F401
from app.models.chat_history import ChatHistory  # noqa: F401

# ──────────────────────────────────────────────
# Import routers
# ──────────────────────────────────────────────
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.report import router as report_router
from app.routers.ai import router as ai_router
from app.routers.chat import router as chat_router
from app.routers.voice import router as voice_router


# ──────────────────────────────────────────────
# Lifespan — runs on startup and shutdown
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables and upload directory on startup."""
    # Startup
    Base.metadata.create_all(bind=engine)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    print("Database tables created")
    print("Upload directory ready")
    yield
    # Shutdown
    print("Application shutting down...")


# ──────────────────────────────────────────────
# Create FastAPI app
# ──────────────────────────────────────────────
app = FastAPI(
    title="AI Health Diagnosis Assistant",
    description=(
        "AI-powered medical report analysis using RAG, OCR, "
        "and Google MedGemma. Supports English and Telugu."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
# CORS Middleware
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Global Exception Handler
# ──────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a clean JSON error."""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred.",
            "error": str(exc),
        },
    )


# ──────────────────────────────────────────────
# Register Routers
# ──────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(report_router)
app.include_router(ai_router)
app.include_router(chat_router)
app.include_router(voice_router)


# ──────────────────────────────────────────────
# Root Endpoints
# ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def home():
    """Root endpoint — confirms the API is running."""
    return {
        "message": "Welcome to AI Health Diagnosis Assistant",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    """Health check endpoint for monitoring."""
    return {"status": "Server Running Successfully"}

# ──────────────────────────────────────────────
# Serve React Frontend
# ──────────────────────────────────────────────
# Mount static folder if it exists (for production)
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.api_route("/{path_name:path}", methods=["GET"])
    async def catch_all(request: Request, path_name: str):
        """
        Catch-all route to serve React's index.html for SPA routing.
        Skips /api, /docs, /openapi.json
        """
        if path_name.startswith("docs") or path_name.startswith("openapi.json"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        return FileResponse("static/index.html")