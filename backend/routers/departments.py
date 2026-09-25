"""
IntelliMed - Departments Router
Hospital department management endpoints.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.department import Department
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, require_admin

router = APIRouter(prefix="/api/departments", tags=["Departments"])


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[DepartmentResponse])
async def list_departments(
    db: Session = Depends(get_db),
):
    """List all active departments (public endpoint for registration)."""
    return db.query(Department).filter(Department.is_active == True).order_by(Department.name).all()


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    data: DepartmentCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new department (Admin only)."""
    existing = db.query(Department).filter(Department.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Department '{data.name}' already exists.")

    dept = Department(**data.model_dump(), is_active=True)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/{dept_id}", response_model=DepartmentResponse)
async def get_department(
    dept_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a department by ID."""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    return dept


@router.put("/{dept_id}", response_model=DepartmentResponse)
async def update_department(
    dept_id: int,
    data: DepartmentUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update a department (Admin only)."""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)

    db.commit()
    db.refresh(dept)
    return dept
