"""
Application Configuration
Loads all environment variables from .env file.
Provides centralized access to configuration values.
"""

from dotenv import load_dotenv
from pathlib import Path
import os

# ──────────────────────────────────────────────
# Load .env from backend folder
# ──────────────────────────────────────────────
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_health.db")

# ──────────────────────────────────────────────
# JWT Authentication
# ──────────────────────────────────────────────
SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

# ──────────────────────────────────────────────
# Google Gemini / MedGemma
# ──────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME: str = os.getenv("MODEL_NAME", "gemini-2.5-flash")

# ──────────────────────────────────────────────
# File Uploads
# ──────────────────────────────────────────────
UPLOAD_DIR: str = os.getenv(
    "UPLOAD_DIR",
    str(Path(__file__).resolve().parent.parent / "uploads")
)
ALLOWED_EXTENSIONS: set = {"pdf", "png", "jpg", "jpeg"}
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))

# ──────────────────────────────────────────────
# ChromaDB (Vector Store)
# ──────────────────────────────────────────────
CHROMA_DB_PATH: str = os.getenv(
    "CHROMA_DB_PATH",
    str(Path(__file__).resolve().parent.parent / "chroma_db")
)

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
CORS_ORIGINS: list = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")