"""
IntelliMed - Auth & User Schemas
Pydantic schemas for authentication, token handling, and user management.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# Role schemas
class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: List[str] = []


class RoleResponse(RoleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role_id: Optional[int] = None
    role_name: Optional[str] = "patient"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class DoctorProfileResponse(BaseModel):
    id: int
    user_id: int
    department_id: Optional[int] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    license_no: Optional[str] = None
    experience_years: Optional[int] = 0
    consultation_fee: Optional[float] = 0.0
    is_available: Optional[bool] = True

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    role: RoleResponse
    is_active: bool
    is_verified: bool
    avatar_path: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    doctor_profile: Optional[DoctorProfileResponse] = None

    class Config:
        from_attributes = True


# Token schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# Verification & OTP schemas
class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "registration"  # registration, email_verification, forgot_password, login


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "registration"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=6)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
