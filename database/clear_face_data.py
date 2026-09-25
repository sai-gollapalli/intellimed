"""
IntelliMed - Clear Face Data Script
One-time utility to delete all face embeddings from the database
and remove face image files from disk. Run this before re-enrolling faces.

Usage:
    python -m database.clear_face_data
"""

import os
import sys
import logging

# Ensure the project root is on the path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from backend.database import SessionLocal
from backend.models.patient_face_embedding import PatientFaceEmbedding

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("clear_face_data")


def clear_face_embeddings():
    """Delete all face embedding records from the database."""
    db = SessionLocal()
    try:
        count = db.query(PatientFaceEmbedding).count()
        if count == 0:
            logger.info("No face embeddings found in the database. Nothing to clear.")
            return 0

        db.query(PatientFaceEmbedding).delete()
        db.commit()
        logger.info(f"Deleted {count} face embedding(s) from the database.")
        return count
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to clear face embeddings: {e}")
        raise
    finally:
        db.close()


def clear_face_images():
    """Remove face image files from the uploads/faces directory."""
    faces_dir = os.path.join(project_root, "uploads", "faces")
    if not os.path.exists(faces_dir):
        logger.info(f"Face images directory does not exist: {faces_dir}")
        return 0

    file_count = 0
    for filename in os.listdir(faces_dir):
        filepath = os.path.join(faces_dir, filename)
        if os.path.isfile(filepath):
            os.remove(filepath)
            file_count += 1

    logger.info(f"Removed {file_count} face image file(s) from {faces_dir}.")
    return file_count


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("IntelliMed - Clearing All Face Data")
    logger.info("=" * 60)

    embeddings_cleared = clear_face_embeddings()
    images_cleared = clear_face_images()

    logger.info(f"Done. Cleared {embeddings_cleared} embeddings and {images_cleared} image files.")
    logger.info("Patients will need to re-enroll their faces.")
