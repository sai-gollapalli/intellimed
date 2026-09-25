"""
IntelliMed - Database Configuration
SQLAlchemy engine, session factory, and base model.
"""

import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.config import settings

logger = logging.getLogger("intellimed.database")

def _get_engine():
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected to PostgreSQL database: {settings.DATABASE_URL}")
        return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
        fallback_url = "sqlite:///./intellimed.db"
        return create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG
        )

# Create SQLAlchemy engine
engine = _get_engine()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def get_db():
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables in the database. Used for initial setup."""
    Base.metadata.create_all(bind=engine)
