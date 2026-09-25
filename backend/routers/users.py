"""
IntelliMed - Users Router
Staff management endpoints for hospital staff (doctors, receptionists, lab techs, pharmacists).
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models.user import User
from backend.models.doctor import Doctor
from backend.models.role import Role
from backend.models.department import Department
from backend.schemas.auth import UserResponse
from backend.middleware.auth_middleware import get_current_user, require_roles
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.security import hash_password

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/staff", response_model=List[UserResponse])
async def list_staff(
    role: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List hospital staff with optional filters. Patients can only see active doctors."""
    from sqlalchemy.orm import joinedload
    
    # Staff roles (excluding patients)
    staff_roles = ["super_admin", "hospital_admin", "receptionist", "doctor", "lab_technician", "pharmacist"]
    
    query = db.query(User).join(Role).filter(Role.name.in_(staff_roles)).options(joinedload(User.doctor_profile))
    
    # If patient, only show active doctors
    if current_user.role.name == "patient":
        query = query.filter(Role.name == "doctor", User.is_active == True)
    
    if role:
        # Only allow filtering by role if not a patient
        if current_user.role.name != "patient":
            query = query.filter(Role.name == role)
    if is_active is not None:
        # Only allow filtering by active status if not a patient
        if current_user.role.name != "patient":
            query = query.filter(User.is_active == is_active)
    
    users = query.order_by(User.created_at.desc()).all()
    
    # Build response with doctor profile included
    result = []
    for user in users:
        # Create a dict from user without doctor_profile to avoid validation error
        user_dict = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'role': {
                'id': user.role.id,
                'name': user.role.name,
                'display_name': user.role.display_name,
                'description': user.role.description,
                'permissions': user.role.permissions,
                'created_at': user.role.created_at
            },
            'is_active': user.is_active,
            'is_verified': user.is_verified,
            'avatar_path': user.avatar_path,
            'last_login_at': user.last_login_at,
            'created_at': user.created_at,
            'doctor_profile': None
        }
        
        # Add doctor profile if exists
        if user.doctor_profile:
            user_dict['doctor_profile'] = {
                'id': user.doctor_profile.id,
                'user_id': user.doctor_profile.user_id,
                'department_id': user.doctor_profile.department_id,
                'specialization': user.doctor_profile.specialization,
                'qualification': user.doctor_profile.qualification,
                'license_no': user.doctor_profile.license_no,
                'experience_years': user.doctor_profile.experience_years,
                'consultation_fee': user.doctor_profile.consultation_fee,
                'is_available': user.doctor_profile.is_available,
                'user': {
                    'id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.full_name
                }
            }
        
        result.append(UserResponse(**user_dict))
    
    return result


@router.get("/staff/{user_id}", response_model=UserResponse)
async def get_staff_member(
    user_id: int,
    current_user: User = Depends(require_roles(["super_admin", "hospital_admin"])),
    db: Session = Depends(get_db),
):
    """Get a specific staff member by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Ensure it's a staff member
    if user.role.name not in ["super_admin", "hospital_admin", "receptionist", "doctor", "lab_technician", "pharmacist"]:
        raise HTTPException(status_code=404, detail="User is not a staff member.")
    
    return UserResponse.model_validate(user)


@router.post("/staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    data: dict,
    request: Request,
    current_user: User = Depends(require_roles(["super_admin", "hospital_admin"])),
    db: Session = Depends(get_db),
):
    """Create a new staff member."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.get("email")).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered.")
    
    # Get role
    role = db.query(Role).filter(Role.id == data.get("role_id")).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    
    # Validate role is a staff role
    if role.name not in ["super_admin", "hospital_admin", "receptionist", "doctor", "lab_technician", "pharmacist"]:
        raise HTTPException(status_code=400, detail="Invalid role for staff creation.")
    
    # Create user
    user = User(
        email=data.get("email"),
        password_hash=hash_password(data.get("password", "Temp@123")),
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        phone=data.get("phone"),
        role_id=role.id,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()
    
    # If doctor, create doctor profile
    if role.name == "doctor":
        department_id = data.get("department_id")
        if not department_id:
            raise HTTPException(status_code=400, detail="Department ID required for doctors.")
        
        doctor = Doctor(
            user_id=user.id,
            department_id=department_id,
            specialization=data.get("specialization", "General Physician"),
            qualification=data.get("qualification"),
            license_no=data.get("license_no", f"LIC-{user.id}"),
            experience_years=data.get("experience_years", 0),
            consultation_fee=data.get("consultation_fee", 500),
            bio=data.get("bio"),
            is_available=data.get("is_available", True),
        )
        db.add(doctor)
    
    db.commit()
    db.refresh(user)
    
    create_audit_log(
        db, user_id=current_user.id, action="create_staff",
        resource="users", resource_id=user.id,
        ip_address=request.client.host if request.client else None,
    )
    
    return UserResponse.model_validate(user)


@router.patch("/staff/{user_id}", response_model=UserResponse)
async def update_staff(
    user_id: int,
    data: dict,
    request: Request,
    current_user: User = Depends(require_roles(["super_admin", "hospital_admin"])),
    db: Session = Depends(get_db),
):
    """Update staff member details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Update user fields
    for field in ["first_name", "last_name", "phone", "is_active"]:
        if field in data:
            setattr(user, field, data[field])
    
    # Update password if provided
    if "password" in data:
        user.password_hash = hash_password(data["password"])
    
    # Update doctor profile if applicable
    if user.role.name == "doctor":
        doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if doctor:
            for field in ["specialization", "qualification", "experience_years", "consultation_fee", "bio", "is_available"]:
                if field in data:
                    setattr(doctor, field, data[field])
            if "department_id" in data:
                doctor.department_id = data["department_id"]
    
    db.commit()
    db.refresh(user)
    
    create_audit_log(
        db, user_id=current_user.id, action="update_staff",
        resource="users", resource_id=user.id,
        ip_address=request.client.host if request.client else None,
    )
    
    return UserResponse.model_validate(user)


@router.delete("/staff/{user_id}")
async def delete_staff(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_roles(["super_admin"])),
    db: Session = Depends(get_db),
):
    """Delete a staff member (Super Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account.")
    
    # Prevent deleting super admins
    if user.role.name == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot delete super admin accounts.")
    
    db.delete(user)
    db.commit()
    
    create_audit_log(
        db, user_id=current_user.id, action="delete_staff",
        resource="users", resource_id=user_id,
        ip_address=request.client.host if request.client else None,
    )
    
    return {"message": "Staff member deleted successfully."}
