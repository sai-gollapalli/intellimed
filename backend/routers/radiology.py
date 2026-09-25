"""
IntelliMed - Radiology Router
Radiology report management endpoints for MRI, CT Scan, X-Ray, ECG, Ultrasound.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.radiology_report import RadiologyReport
from backend.models.patient import Patient
from backend.models.doctor import Doctor
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, require_roles
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import generate_report_code

router = APIRouter(prefix="/api/radiology", tags=["Radiology"])


class RadiologyReportCreate(BaseModel):
    patient_id: int
    doctor_id: int
    report_type: str  # mri, ct_scan, x_ray, ecg, ultrasound
    body_part: Optional[str] = None
    findings: Optional[str] = None
    impression: Optional[str] = None
    performed_at: Optional[datetime] = None


class RadiologyReportUpdate(BaseModel):
    report_type: Optional[str] = None
    body_part: Optional[str] = None
    findings: Optional[str] = None
    impression: Optional[str] = None
    status: Optional[str] = None
    performed_at: Optional[datetime] = None


class RadiologyReportResponse(BaseModel):
    id: int
    report_code: str
    patient_id: int
    doctor_id: int
    technician_id: Optional[int] = None
    report_type: str
    body_part: Optional[str] = None
    findings: Optional[str] = None
    impression: Optional[str] = None
    image_paths: Optional[List[str]] = None
    status: str
    pdf_path: Optional[str] = None
    performed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[RadiologyReportResponse])
async def list_radiology_reports(
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    report_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List radiology reports with optional filters."""
    query = db.query(RadiologyReport)
    
    # Patients can only see their own reports
    if current_user.role.name == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if patient:
            query = query.filter(RadiologyReport.patient_id == patient.id)
        else:
            return []
    elif patient_id:
        # Staff can filter by patient if specified
        query = query.filter(RadiologyReport.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(RadiologyReport.doctor_id == doctor_id)
    if status:
        query = query.filter(RadiologyReport.status == status)
    if report_type:
        query = query.filter(RadiologyReport.report_type == report_type)
    
    reports = query.order_by(RadiologyReport.created_at.desc()).all()
    return reports


@router.get("/{report_id}", response_model=RadiologyReportResponse)
async def get_radiology_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific radiology report by ID."""
    report = db.query(RadiologyReport).filter(RadiologyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Radiology report not found.")
    
    # Patients can only access their own reports
    if current_user.role.name == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or report.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied.")
    
    return report


@router.post("", response_model=RadiologyReportResponse, status_code=status.HTTP_201_CREATED)
async def create_radiology_report(
    data: RadiologyReportCreate,
    request: Request,
    current_user: User = Depends(require_roles(["doctor", "lab_technician", "hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Create a new radiology report."""
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    # Validate doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")
    
    # Generate report code
    report_code = generate_report_code("RD")
    
    report = RadiologyReport(
        report_code=report_code,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        technician_id=current_user.id if current_user.role.name == "lab_technician" else None,
        report_type=data.report_type,
        body_part=data.body_part,
        findings=data.findings,
        impression=data.impression,
        performed_at=data.performed_at,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    create_audit_log(
        db, user_id=current_user.id, action="create_radiology_report",
        resource="radiology", resource_id=report.id,
        ip_address=request.client.host if request.client else None,
    )
    
    return report


@router.put("/{report_id}", response_model=RadiologyReportResponse)
async def update_radiology_report(
    report_id: int,
    data: RadiologyReportUpdate,
    request: Request,
    current_user: User = Depends(require_roles(["doctor", "lab_technician", "hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Update a radiology report."""
    report = db.query(RadiologyReport).filter(RadiologyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Radiology report not found.")
    
    # Update fields
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    
    create_audit_log(
        db, user_id=current_user.id, action="update_radiology_report",
        resource="radiology", resource_id=report.id,
        ip_address=request.client.host if request.client else None,
    )
    
    return report


@router.post("/{report_id}/images", response_model=RadiologyReportResponse)
async def upload_radiology_images(
    report_id: int,
    images: List[UploadFile] = File(...),
    current_user: User = Depends(require_roles(["lab_technician", "doctor", "hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Upload images for a radiology report."""
    report = db.query(RadiologyReport).filter(RadiologyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Radiology report not found.")
    
    import os
    from backend.config import settings
    
    image_paths = []
    for image in images:
        # Validate image type
        if not image.content_type or not image.content_type.startswith("image/"):
            continue
        
        # Save image
        file_extension = image.filename.split(".")[-1] if "." in image.filename else "jpg"
        filename = f"radiology_{report_id}_{len(image_paths) + 1}.{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, "radiology", filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(await image.read())
        
        image_paths.append(f"/uploads/radiology/{filename}")
    
    # Update report with image paths
    current_paths = list(report.image_paths or [])
    current_paths.extend(image_paths)
    report.image_paths = current_paths
    
    db.commit()
    db.refresh(report)
    
    return report


@router.patch("/{report_id}/status")
async def update_report_status(
    report_id: int,
    status: str,
    request: Request,
    current_user: User = Depends(require_roles(["lab_technician", "doctor", "hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Update radiology report status."""
    report = db.query(RadiologyReport).filter(RadiologyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Radiology report not found.")
    
    valid_statuses = ["pending", "processing", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    report.status = status
    db.commit()
    
    create_audit_log(
        db, user_id=current_user.id, action="update_radiology_status",
        resource="radiology", resource_id=report.id,
        ip_address=request.client.host if request.client else None,
    )
    
    return {"message": f"Report status updated to {status}"}


@router.delete("/{report_id}")
async def delete_radiology_report(
    report_id: int,
    request: Request,
    current_user: User = Depends(require_roles(["hospital_admin", "super_admin"])),
    db: Session = Depends(get_db),
):
    """Delete a radiology report (Admin only)."""
    report = db.query(RadiologyReport).filter(RadiologyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Radiology report not found.")
    
    db.delete(report)
    db.commit()
    
    create_audit_log(
        db, user_id=current_user.id, action="delete_radiology_report",
        resource="radiology", resource_id=report_id,
        ip_address=request.client.host if request.client else None,
    )
    
    return {"message": "Radiology report deleted successfully."}
