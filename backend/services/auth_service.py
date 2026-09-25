"""
IntelliMed - Auth Service
User registration, authentication, token refresh, password management, and sessions.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.user import User
from backend.models.role import Role
from backend.models.session import Session as UserSession
from backend.schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from backend.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from backend.services.email_service import send_welcome_email
from backend.services.otp_service import create_and_send_otp, verify_otp_code


def normalize_email(email: Optional[str]) -> str:
    """Normalize email addresses for consistent auth and duplicate checks."""
    if not email:
        return ""
    return str(email).strip().lower()


def register_user(db: Session, user_data: UserCreate) -> User:
    """Register a new user in the system."""
    normalized_email = normalize_email(user_data.email)
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )

    # Determine role
    role = None
    if user_data.role_id:
        role = db.query(Role).filter(Role.id == user_data.role_id).first()
    elif user_data.role_name:
        role = db.query(Role).filter(Role.name == user_data.role_name).first()

    if not role:
        # Default to patient if role not found
        role = db.query(Role).filter(Role.name == "patient").first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Default patient role not found in database. Please seed initial roles."
            )

    new_user = User(
        email=normalized_email,
        password_hash=hash_password(user_data.password),
        first_name=user_data.first_name.strip(),
        last_name=user_data.last_name.strip(),
        phone=user_data.phone.strip() if user_data.phone else None,
        role_id=role.id,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(
    db: Session,
    login_data: UserLogin,
    device_info: str = None,
    ip_address: str = None
) -> TokenResponse:
    """Authenticate a user and return access & refresh tokens."""
    user = db.query(User).filter(User.email == normalize_email(login_data.email)).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact hospital administrator."
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)

    # Issue tokens
    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Track session
    session_record = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        device_info=device_info,
        ip_address=ip_address,
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session_record)
    db.commit()

    # Build user response without doctor_profile to avoid validation issues
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

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(**user_dict)
    )


def refresh_access_token(db: Session, refresh_token_str: str) -> TokenResponse:
    """Issue a new access token using a valid refresh token."""
    try:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type.")
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    session_record = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token_str,
        UserSession.is_active == True
    ).first()

    if not session_record:
        raise HTTPException(status_code=401, detail="Session expired or invalidated.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account inactive or not found.")

    new_access_token = create_access_token({"sub": str(user.id), "role": user.role.name})

    # Build user response without doctor_profile to avoid validation issues
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

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(**user_dict)
    )


def logout_user(db: Session, refresh_token_str: str):
    """Deactivate user session."""
    session_record = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token_str
    ).first()

    if session_record:
        session_record.is_active = False
        db.commit()
