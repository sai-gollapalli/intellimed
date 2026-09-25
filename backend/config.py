"""
IntelliMed - Backend Configuration
Loads settings from .env file using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ---- App ----
    APP_NAME: str = "IntelliMed"
    APP_VERSION: str = "1.0.0"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    DEBUG: bool = True

    # ---- Database ----
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/intellimed_db"

    # ---- JWT ----
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---- CORS ----
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # ---- Email (Gmail SMTP) ----
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_NAME: str = "IntelliMed Hospital"
    SMTP_FROM_EMAIL: str = ""

    @property
    def email_configured(self) -> bool:
        return bool(self.SMTP_USER and self.SMTP_PASSWORD)

    @property
    def smtp_from_address(self) -> str:
        return self.SMTP_FROM_EMAIL or self.SMTP_USER or ""

    # ---- OTP ----
    OTP_EXPIRE_MINUTES: int = 5
    OTP_LENGTH: int = 6

    # ---- File Upload ----
    UPLOAD_DIR: str = "../uploads"
    REPORTS_DIR: str = "../reports"
    QR_CODES_DIR: str = "../qr_codes"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ---- Face Recognition ----
    FACE_RECOGNITION_THRESHOLD: float = 0.88
    FACE_MODEL_DIR: str = "../ai/models"
    LIVENESS_DETECTION_ENABLED: bool = True
    FACE_MIN_ENROLLMENT_SAMPLES: int = 3   # Require 3 distinct angles during enrollment
    FACE_LOGIN_FRAME_COUNT: int = 5
    FACE_LOGIN_CONSENSUS_RATIO: float = 0.80  # 80% of captured frames must agree (4 out of 5 frames)

    # ---- Rate Limiting ----
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton settings instance
settings = Settings()
