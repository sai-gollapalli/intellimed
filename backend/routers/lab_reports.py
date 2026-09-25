"""
IntelliMed - Lab Reports Router
Lab technician report submission and doctor/patient viewing.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models.lab_report import LabReport
from backend.models.user import User
from backend.schemas.auth import UserResponse
from backend.middleware.auth_middleware import get_current_user, require_lab_tech, require_roles
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import generate_code
from backend.utils.file_upload import save_upload_file, ALLOWED_DOCUMENT_TYPES

from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


# ── Inline schemas ────────────────────────────────────────────────────────────

class LabResultItem(BaseModel):
    parameter: str
    value: str
    unit: str
    normal_range: str
    status: str  # normal, abnormal, critical


class LabReportCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    report_type: str  # CBC, LFT, RFT, etc.
    test_name: str
    results: List[LabResultItem]
    notes: Optional[str] = None


class LabReportUpdate(BaseModel):
    results: Optional[List[LabResultItem]] = None
    status: Optional[str] = None  # pending, completed
    notes: Optional[str] = None


class LabReportResponse(BaseModel):
    id: int
    report_code: str
    patient_id: int
    doctor_id: Optional[int] = None
    report_type: str
    test_name: str
    results: List[Any]
    status: str
    notes: Optional[str] = None
    pdf_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/api/lab-reports", tags=["Lab Reports"])


def _next_report_code(db: Session) -> str:
    last = db.query(func.max(LabReport.id)).scalar() or 0
    return generate_code("LR", last)


@router.post("", response_model=LabReportResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_report(
    data: LabReportCreate,
    request: Request,
    current_user: User = Depends(require_lab_tech),
    db: Session = Depends(get_db),
):
    """Lab technician submits a new lab report."""
    report = LabReport(
        report_code=_next_report_code(db),
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        report_type=data.report_type,
        test_name=data.test_name,
        results=[r.model_dump() for r in data.results],
        notes=data.notes,
        status="completed",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    create_audit_log(
        db, user_id=current_user.id, action="create_lab_report",
        resource="lab_reports", resource_id=report.id,
        ip_address=request.client.host if request.client else None,
    )
    return report


@router.get("", response_model=list[LabReportResponse])
async def list_lab_reports(
    patient_id: Optional[int] = Query(None),
    report_status: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List lab reports with optional filters."""
    query = db.query(LabReport)

    if patient_id:
        query = query.filter(LabReport.patient_id == patient_id)
    if report_status:
        query = query.filter(LabReport.status == report_status)

    if current_user.role.name == "patient":
        from backend.models.patient import Patient as PatientModel
        patient = db.query(PatientModel).filter(PatientModel.user_id == current_user.id).first()
        if patient:
            query = query.filter(LabReport.patient_id == patient.id)
        else:
            return []

    return (
        query
        .order_by(LabReport.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )


@router.get("/{report_id}", response_model=LabReportResponse)
async def get_lab_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get single lab report."""
    report = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found.")
    return report


@router.post("/{report_id}/upload-pdf")
async def upload_lab_report_pdf(
    report_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_lab_tech),
    db: Session = Depends(get_db),
):
    """Upload PDF for a lab report."""
    report = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found.")

    from backend.config import settings
    pdf_path = await save_upload_file(
        file,
        subdirectory=f"lab_reports/{report.report_code}",
        allowed_types=ALLOWED_DOCUMENT_TYPES,
        base_dir=settings.REPORTS_DIR,
    )
    report.pdf_path = pdf_path
    db.commit()
    return {"message": "PDF uploaded successfully.", "pdf_path": pdf_path}
