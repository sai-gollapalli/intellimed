"""
IntelliMed - File Upload Utilities
Handles secure file uploads with validation.
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional, List

from fastapi import UploadFile, HTTPException

from backend.config import settings


# Allowed file types by category
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
ALLOWED_REPORT_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/dicom"}

MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Convert to bytes


def _ensure_dir(directory: str) -> Path:
    """Ensure a directory exists, create if needed."""
    path = Path(directory)
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload_file(
    file: UploadFile,
    subdirectory: str,
    allowed_types: set = None,
    base_dir: str = None,
) -> str:
    """
    Save an uploaded file securely.
    
    Args:
        file: The uploaded file
        subdirectory: Subdirectory within upload dir (e.g., "patients/photos")
        allowed_types: Set of allowed MIME types
        base_dir: Base directory (defaults to UPLOAD_DIR)
    
    Returns:
        Relative path to the saved file
    
    Raises:
        HTTPException: If file type is not allowed or file is too large
    """
    if allowed_types and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Allowed: {', '.join(allowed_types)}"
        )

    # Read file content to check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

    # Generate unique filename
    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    unique_name = f"{uuid.uuid4().hex}{ext}"
    
    # Create directory and save
    upload_dir = base_dir or settings.UPLOAD_DIR
    save_dir = _ensure_dir(os.path.join(upload_dir, subdirectory))
    file_path = save_dir / unique_name

    with open(file_path, "wb") as f:
        f.write(content)

    # Return relative path
    return os.path.join(subdirectory, unique_name)


async def save_face_image(file: UploadFile, patient_code: str) -> str:
    """Save a face image for a patient."""
    return await save_upload_file(
        file,
        subdirectory=f"faces/{patient_code}",
        allowed_types=ALLOWED_IMAGE_TYPES,
    )


async def save_patient_photo(file: UploadFile, patient_code: str) -> str:
    """Save a patient profile photo."""
    return await save_upload_file(
        file,
        subdirectory=f"patients/{patient_code}",
        allowed_types=ALLOWED_IMAGE_TYPES,
    )


async def save_document(file: UploadFile, patient_code: str, doc_type: str) -> str:
    """Save a patient document (ID proof, insurance card, etc.)."""
    return await save_upload_file(
        file,
        subdirectory=f"documents/{patient_code}/{doc_type}",
        allowed_types=ALLOWED_DOCUMENT_TYPES,
    )


def delete_file(file_path: str, base_dir: str = None) -> bool:
    """Delete a file by its relative path."""
    upload_dir = base_dir or settings.UPLOAD_DIR
    full_path = os.path.join(upload_dir, file_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except OSError:
        pass
    return False
