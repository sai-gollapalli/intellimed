"""
IntelliMed - Main Application Entry Point
FastAPI app configuration, CORS middleware, API routers, static files, and startup events.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from backend.config import settings
from backend.database import create_tables, engine

# Import all models so SQLAlchemy discovers them for create_tables()
import backend.models  # noqa: F401

from backend.middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from backend.routers import auth
from backend.routers import patients
from backend.routers import appointments
from backend.routers import prescriptions
from backend.routers import lab_reports
from backend.routers import billing
from backend.routers import departments
from backend.routers import users
from backend.routers import radiology
from backend.routers import documents
from backend.routers import notifications

# Configure Logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("intellimed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown events."""
    logger.info("Initializing IntelliMed Backend Services...")
    
    # Ensure upload & generated directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.REPORTS_DIR, exist_ok=True)
    os.makedirs(settings.QR_CODES_DIR, exist_ok=True)

    # Auto-create tables and seed default data
    try:
        create_tables()
        logger.info("Database tables initialized successfully.")
        # Auto-seed roles and departments
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from database.seed import run_seed
        run_seed()
    except Exception as e:
        logger.warning(f"Could not initialize DB tables on startup: {e}")

    yield

    logger.info("Shutting down IntelliMed Backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="IntelliMed - AI Smart Hospital Management & Patient Identification System API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# State & Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS Middleware
cors_origins = settings.cors_origins_list
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.netlify\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Static File Storage Mounts
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
if os.path.exists(settings.REPORTS_DIR):
    app.mount("/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")
if os.path.exists(settings.QR_CODES_DIR):
    app.mount("/qr_codes", StaticFiles(directory=settings.QR_CODES_DIR), name="qr_codes")

# Include Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(prescriptions.router)
app.include_router(lab_reports.router)
app.include_router(billing.router)
app.include_router(departments.router)
app.include_router(users.router)
app.include_router(radiology.router)
app.include_router(documents.router)
app.include_router(notifications.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "email_configured": settings.email_configured,
        "debug": settings.DEBUG
    }


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint redirecting to docs."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API. Visit /docs for Swagger documentation."
    }
