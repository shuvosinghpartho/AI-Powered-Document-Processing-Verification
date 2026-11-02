import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "doc_intelligence.db"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Powered Document Intelligence System"
    VERSION: str = "2.5.0"
    API_PREFIX: str = "/api/v1"
    
    # Gemini API Key (read from environment or .env)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    
    # Storage
    BASE_DIR: Path = BASE_DIR
    UPLOAD_DIR: Path = UPLOAD_DIR
    DB_PATH: Path = DB_PATH
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Supported Formats
    ALLOWED_EXTENSIONS: set = {
        ".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp", ".xlsx", ".xls", ".csv"
    }

settings = Settings()

