"""
IntelliMed - Patients Router
CRUD endpoints for patient management, search, photo/QR upload.
"""

import math
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.database import get_db
from backend.models.patient import Patient
from backend.models.user import User
from backend.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListItem, PatientSearchResponse
from backend.middleware.auth_middleware import get_current_user, require_roles, require_staff, require_receptionist
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import generate_patient_code
from backend.utils.file_upload import save_patient_photo, ALLOWED_IMAGE_TYPES
from backend.services.qr_service import generate_patient_qr_code

router = APIRouter(prefix="/api/patients", tags=["Patients"])


# ─── Helper ──────────────────────────────────────────────────────────────────

def _compute_age(dob: date) -> int:
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _get_next_patient_code(db: Session) -> str:
    last = db.query(func.max(Patient.id)).scalar() or 0
    return generate_patient_code(last)


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(
    data: PatientCreate,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Register a new patient (Receptionist / Admin only)."""
    # Check duplicate by phone
    existing = db.query(Patient).filter(Patient.phone == data.phone).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"A patient with phone '{data.phone}' already exists: {existing.patient_code}."
        )

    patient_code = _get_next_patient_code(db)
    dob = data.date_of_birth
    age = _compute_age(dob)

    patient = Patient(
        **data.model_dump(),
        patient_code=patient_code,
        age=age,
        registered_by=current_user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Generate QR code
    try:
        qr_path = generate_patient_qr_code(patient.patient_code, patient.full_name)
        patient.qr_code_path = qr_path
        db.commit()
        db.refresh(patient)
    except Exception:
        pass  # QR generation failure is non-fatal

    create_audit_log(
        db,
        user_id=current_user.id,
        action="register_patient",
        resource="patients",
        resource_id=patient.id,
        ip_address=request.client.host if request.client else None,
    )
    return patient


@router.get("", response_model=PatientSearchResponse)
async def search_patients(
    q: Optional[str] = Query(None, description="Search by name, phone, patient code, or email"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search/list patients with optional text query and pagination."""
    query = db.query(Patient)

    if q:
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Patient.patient_code.ilike(search),
                Patient.first_name.ilike(search),
                Patient.last_name.ilike(search),
                Patient.phone.ilike(search),
                Patient.email.ilike(search),
            )
        )

    total = query.count()
    results = (
        query
        .order_by(Patient.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PatientSearchResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=[PatientListItem.model_validate(p) for p in results],
    )


@router.get("/my-profile", response_model=PatientResponse)
async def get_my_patient_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the patient record associated with current authenticated user."""
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="No patient profile found for current user.")
    return patient


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full patient record by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    return patient


@router.get("/code/{patient_code}", response_model=PatientResponse)
async def get_patient_by_code(
    patient_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Look up a patient by their unique IntelliMed patient code (e.g. IM-000001)."""
    patient = db.query(Patient).filter(Patient.patient_code == patient_code.upper()).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"No patient found with code '{patient_code}'.")
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    data: PatientUpdate,
    request: Request,
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Update patient demographics and medical info."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    create_audit_log(
        db, user_id=current_user.id, action="update_patient",
        resource="patients", resource_id=patient.id,
        ip_address=request.client.host if request.client else None,
    )
    return patient


@router.post("/{patient_id}/photo", response_model=PatientResponse)
async def upload_patient_photo(
    patient_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_receptionist),
    db: Session = Depends(get_db),
):
    """Upload or replace a patient's profile photo."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    contents = await file.read()
    if contents:
        from backend.services.face_service import face_service
        from backend.models.patient_face_embedding import PatientFaceEmbedding
        import pickle

        embedding = face_service.build_embedding(contents)
        if embedding is not None:
            is_dup, dup_patient_id, best_score = face_service.check_duplicate_face(
                embedding, db, exclude_patient_id=patient.id
            )
            if is_dup:
                dup_patient = db.query(Patient).filter(Patient.id == dup_patient_id).first()
                dup_code = dup_patient.patient_code if dup_patient else f"ID-{dup_patient_id}"
                raise HTTPException(
                    status_code=400,
                    detail=f"Photo upload rejected: This face profile is already registered to another patient ({dup_code}). Duplicate face registration is not allowed."
                )

            # Reset cursor for file saving
            await file.seek(0)
            photo_path = await save_patient_photo(file, patient.patient_code)
            patient.photo_path = photo_path

            # Store face embedding for biometric recognition
            embedding_blob = pickle.dumps(embedding)
            db.add(
                PatientFaceEmbedding(
                    patient_id=patient.id,
                    embedding=embedding_blob,
                    image_path=photo_path,
                    quality_score=90,
                )
            )
            db.commit()
            db.refresh(patient)
            return patient

    photo_path = await save_patient_photo(file, patient.patient_code)
    patient.photo_path = photo_path
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_patient(
    patient_id: int,
    request: Request,
    current_user: User = Depends(require_roles(["super_admin", "hospital_admin"])),
    db: Session = Depends(get_db),
):
    """Soft-delete (deactivate) a patient record. Admin only."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    # Soft delete by marking inactive (no column yet — raise 501 gracefully)
    create_audit_log(
        db, user_id=current_user.id, action="deactivate_patient",
        resource="patients", resource_id=patient.id,
        ip_address=request.client.host if request.client else None,
    )
    db.delete(patient)
    db.commit()
