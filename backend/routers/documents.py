"""
IntelliMed - Patient Documents Router
Patient document management endpoints for ID proofs, insurance cards, medical reports.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.patient_document import PatientDocument
from backend.models.patient import Patient
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, require_roles
from backend.middleware.audit_middleware import create_audit_log
from backend.config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents"])


class DocumentResponse(BaseModel):
    id: int
    patient_id: int
    document_type: str
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    description: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[DocumentResponse])
async def list_patient_documents(
    patient_id: Optional[int] = None,
    document_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List patient documents with optional filters."""
    query = db.query(PatientDocument)
    
    # Patients can only see their own documents
    if current_user.role.name == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient:
            query = query.filter(PatientDocument.patient_id == patient.id)
        else:
            return []
    elif patient_id:
        # Staff can filter by patient if specified
        query = query.filter(PatientDocument.patient_id == patient_id)
    
    if document_type:
        query = query.filter(PatientDocument.document_type == document_type)
    
    documents = query.order_by(PatientDocument.created_at.desc()).all()
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific document by ID."""
    document = db.query(PatientDocument).filter(PatientDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Patients can only access their own documents
    if current_user.role.name == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or document.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied.")
    
    return document


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    patient_id: int,
    document_type: str,
    file: UploadFile = File(...),
    description: Optional[str] = None,
    current_user: User = Depends(require_roles(["receptionist", "doctor", "hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Upload a document for a patient."""
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    # Validate document type
    valid_types = ["id_proof", "insurance_card", "medical_report", "other"]
    if document_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}")
    
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB")
    
    # Save file
    import os
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    filename = f"patient_{patient_id}_{document_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, "documents", filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Create document record
    document = PatientDocument(
        patient_id=patient_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=f"/uploads/documents/{filename}",
        file_size=file_size,
        mime_type=file.content_type,
        description=description,
        uploaded_by=current_user.id
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    create_audit_log(
        db, user_id=current_user.id, action="upload_document",
        resource="documents", resource_id=document.id,
        ip_address=None,
    )
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    request: Request,
    current_user: User = Depends(require_roles(["hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Delete a document (Admin only)."""
    document = db.query(PatientDocument).filter(PatientDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Delete physical file
    import os
    try:
        full_path = document.file_path.replace("/uploads/", settings.UPLOAD_DIR + "/")
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        pass  # Log error but continue with database deletion
    
    db.delete(document)
    db.commit()
    
    create_audit_log(
        db, user_id=current_user.id, action="delete_document",
        resource="documents", resource_id=document_id,
        ip_address=request.client.host if request.client else None,
    )
    
    return {"message": "Document deleted successfully."}
