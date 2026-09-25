"""
IntelliMed - Validators
Common validation functions.
"""

import re
from typing import Optional


def validate_phone(phone: str) -> bool:
    """Validate phone number format (Indian format: 10 digits, optionally with +91)."""
    pattern = r'^(\+91[\-\s]?)?[6-9]\d{9}$'
    return bool(re.match(pattern, phone.strip()))


def validate_email(email: str) -> bool:
    """Basic email format validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def validate_blood_group(blood_group: str) -> bool:
    """Validate blood group string."""
    valid_groups = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
    return blood_group.upper() in valid_groups


def validate_gender(gender: str) -> bool:
    """Validate gender string."""
    valid_genders = {"male", "female", "other"}
    return gender.lower() in valid_genders


def sanitize_string(value: str) -> str:
    """Sanitize a string to prevent XSS attacks."""
    if not value:
        return value
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', value)
    # Remove script-like patterns
    clean = re.sub(r'javascript:', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'on\w+\s*=', '', clean, flags=re.IGNORECASE)
    return clean.strip()


def validate_pincode(pincode: str) -> bool:
    """Validate Indian pincode (6 digits)."""
    return bool(re.match(r'^\d{6}$', pincode.strip()))
