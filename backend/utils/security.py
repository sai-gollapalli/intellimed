"""
IntelliMed - Security Utilities
JWT token creation/verification, password hashing, and token generation.
"""

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import jwt
from passlib.context import CryptContext

from backend.config import settings


import bcrypt

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        pwd_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Payload data (must include 'sub' for user ID)
        expires_delta: Custom expiration time
    
    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    })
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a JWT refresh token with longer expiry.
    
    Args:
        data: Payload data (must include 'sub' for user ID)
        expires_delta: Custom expiration time
    
    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    })
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload dictionary
    
    Raises:
        jwt.ExpiredSignatureError: If token has expired
        jwt.InvalidTokenError: If token is invalid
    """
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def generate_otp(length: int = None) -> str:
    """Generate a numeric OTP code."""
    otp_length = length or settings.OTP_LENGTH
    return "".join(secrets.choice(string.digits) for _ in range(otp_length))


def generate_patient_code(last_id: int) -> str:
    """Generate patient code like IM-000001."""
    return f"IM-{str(last_id + 1).zfill(6)}"


def generate_code(prefix: str, last_id: int) -> str:
    """Generate a code with prefix like RX-000001, LR-000001, etc."""
    return f"{prefix}-{str(last_id + 1).zfill(6)}"


def generate_report_code(prefix: str = "RD") -> str:
    """Generate a unique report code with prefix like RD-000001."""
    import random
    return f"{prefix}-{str(random.randint(1, 999999)).zfill(6)}"
