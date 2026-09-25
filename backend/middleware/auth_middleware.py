"""
IntelliMed - Auth Middleware
JWT authentication dependency and role-based access control.
"""

from datetime import datetime, timezone
from typing import List, Optional

import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.config import settings
from backend.models.user import User
from backend.utils.security import decode_token


# HTTP Bearer scheme for Swagger UI integration
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Extract and validate the current user from JWT token.
    
    Raises:
        HTTPException 401: If token is invalid, expired, or user not found
        HTTPException 403: If user is inactive or unverified
    """
    token = credentials.credentials
    
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Ensure it's an access token
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


def require_roles(allowed_roles: List[str]):
    """
    Dependency factory for role-based access control.
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles(["super_admin", "hospital_admin"]))])
    
    Args:
        allowed_roles: List of role names that can access the endpoint
    """
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}",
            )
        return current_user
    return role_checker


# Pre-configured role dependencies for convenience
require_super_admin = require_roles(["super_admin"])
require_admin = require_roles(["super_admin", "hospital_admin"])
require_receptionist = require_roles(["super_admin", "hospital_admin", "receptionist"])
require_doctor = require_roles(["super_admin", "hospital_admin", "doctor"])
require_lab_tech = require_roles(["super_admin", "hospital_admin", "lab_technician"])
require_pharmacist = require_roles(["super_admin", "hospital_admin", "pharmacist"])
require_patient = require_roles(["patient"])
require_staff = require_roles(["super_admin", "hospital_admin", "receptionist", "doctor", "lab_technician", "pharmacist"])
