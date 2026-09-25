"""
IntelliMed - Auth Router
Endpoints for user registration, login, logout, token refresh, email verification, OTP, and password reset.
"""

import io
import logging
import pickle
from datetime import date, datetime, timedelta, timezone

logger = logging.getLogger("intellimed.auth")

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.patient import Patient
from backend.models.patient_face_embedding import PatientFaceEmbedding
from backend.models.session import Session as UserSession
from backend.models.user import User
from backend.schemas.auth import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest
)
from backend.services.auth_service import (
    register_user,
    authenticate_user,
    refresh_access_token,
    logout_user,
    normalize_email,
)
from backend.services.otp_service import create_and_send_otp, verify_otp_code
from backend.services.email_service import send_welcome_email
from backend.middleware.auth_middleware import get_current_user
from backend.middleware.audit_middleware import create_audit_log
from backend.utils.file_upload import save_face_image
from backend.config import settings
from backend.utils.security import (
    create_access_token,
    create_refresh_token,
    generate_patient_code,
    hash_password,
    verify_password,
)
from backend.services.face_service import face_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _ensure_patient_record(db: Session, user: User) -> Patient:
    """Create a linked patient record for a registered user if one does not already exist."""
    existing_patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if existing_patient:
        return existing_patient

    placeholder_dob = date.today() - timedelta(days=365 * 18)
    last_patient = db.query(Patient).order_by(Patient.id.desc()).first()
    patient_code = generate_patient_code(last_patient.id if last_patient else 0)

    patient = Patient(
        patient_code=patient_code,
        user_id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        date_of_birth=placeholder_dob,
        gender="Other",
        phone=user.phone or "",
        email=user.email,
        registered_by=user.id,
    )
    db.add(patient)
    db.flush()
    return patient




@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user and send verification OTP."""
    user = register_user(db, user_data)
    
    # Audit log
    create_audit_log(
        db,
        user_id=user.id,
        action="register",
        resource="users",
        resource_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    try:
        patient = _ensure_patient_record(db, user)
        db.commit()
        db.refresh(patient)
    except Exception:
        db.rollback()
        raise

    # Send welcome email and registration OTP
    await send_welcome_email(user.email, user.full_name, user.role.display_name, db=db)
    await create_and_send_otp(db, email=user.email, purpose="email_verification", user_id=user.id)

    return UserResponse.model_validate(user)


@router.post("/register-staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_staff(staff_data: dict, request: Request, db: Session = Depends(get_db)):
    """Register a new staff member (doctor, admin, etc.) without OTP verification."""
    from backend.models.doctor import Doctor
    from backend.models.department import Department

    # Extract basic user fields
    first_name = staff_data.get("first_name")
    last_name = staff_data.get("last_name")
    email = staff_data.get("email")
    phone = staff_data.get("phone")
    password = staff_data.get("password")
    role_name = staff_data.get("role_name", "doctor")
    department_id = staff_data.get("department_id")

    # Validate required fields
    if not all([first_name, last_name, email, password]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Get role
    from backend.models.role import Role
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{role_name}' not found")

    # Hash password
    password_hash = hash_password(password)

    # Create user
    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        password_hash=password_hash,
        role_id=role.id,
        is_active=True,
        is_verified=True,  # Auto-verify staff accounts
        email_verified_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.flush()

    # Create doctor profile if role is doctor
    if role_name == "doctor":
        specialization = staff_data.get("specialization")
        qualification = staff_data.get("qualification")
        license_number = staff_data.get("license_number")
        experience_years = staff_data.get("experience_years", 0)
        consultation_fee = staff_data.get("consultation_fee", 0)

        if not all([specialization, qualification, license_number, department_id]):
            raise HTTPException(status_code=400, detail="Doctor-specific fields (specialization, qualification, license_number, department) are required")

        # Validate department exists
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=400, detail="Department not found")

        doctor = Doctor(
            user_id=user.id,
            department_id=department_id,
            specialization=specialization,
            qualification=qualification,
            license_no=license_number,
            experience_years=experience_years,
            consultation_fee=consultation_fee,
            is_available=True
        )
        db.add(doctor)

    # Audit log
    create_audit_log(
        db,
        user_id=user.id,
        action="register_staff",
        resource="users",
        resource_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    db.commit()
    db.refresh(user)

    # Send welcome email (no OTP for staff) - don't fail if email fails
    try:
        await send_welcome_email(user.email, user.full_name, user.role.display_name, db=db)
    except Exception as e:
        logger.warning(f"Failed to send welcome email to {user.email}: {e}")
        # Continue without failing the registration

    # Build response without doctor_profile to avoid validation issues
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

    return UserResponse(**user_dict)


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    request: Request,
    portal: str = "any",
    db: Session = Depends(get_db)
):
    """
    Authenticate user with email and password.
    Supports portal parameter ('patient', 'staff', 'any') to enforce role boundary.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "Unknown")

    tokens = authenticate_user(db, login_data, device_info=user_agent, ip_address=client_ip)

    user = tokens.user
    staff_roles = {"super_admin", "hospital_admin", "receptionist", "doctor", "lab_technician", "pharmacist"}

    if portal == "patient" and user.role.name != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This login portal is reserved for patients only. Please use the Staff Login portal."
        )
    elif portal == "staff" and user.role.name not in staff_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This login portal is reserved for hospital staff only. Please use the Patient Login portal."
        )

    # Audit log
    create_audit_log(
        db,
        user_id=tokens.user.id,
        action="login",
        resource="auth",
        ip_address=client_ip,
        user_agent=user_agent
    )

    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    return refresh_access_token(db, req.refresh_token)


@router.post("/logout")
async def logout(req: RefreshTokenRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout user and invalidate session."""
    logout_user(db, req.refresh_token)
    create_audit_log(db, user_id=current_user.id, action="logout", resource="auth")
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.post("/send-otp")
async def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    """Generate and send OTP to specified email."""
    normalized_email = normalize_email(req.email)
    success, msg = await create_and_send_otp(db, email=normalized_email, purpose=req.purpose)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify an OTP code."""
    normalized_email = normalize_email(req.email)
    success, msg = verify_otp_code(db, email=normalized_email, code=req.code, purpose=req.purpose)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    
    # If verifying email, mark user as verified
    if req.purpose in ("registration", "email_verification"):
        user = db.query(User).filter(User.email == normalized_email).first()
        if user:
            user.is_verified = True
            db.commit()

    return {"message": msg, "verified": True}


@router.get("/face-enrollment-status")
async def get_face_enrollment_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check face enrollment status for current user."""
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return {"sample_count": 0, "minimum_required": settings.FACE_MIN_ENROLLMENT_SAMPLES, "enrolled": False}

    sample_count = db.query(PatientFaceEmbedding).filter(PatientFaceEmbedding.patient_id == patient.id).count()
    return {
        "sample_count": sample_count,
        "minimum_required": settings.FACE_MIN_ENROLLMENT_SAMPLES,
        "enrolled": sample_count >= settings.FACE_MIN_ENROLLMENT_SAMPLES
    }


@router.post("/face-enroll")
async def face_enroll(
    files: list[UploadFile] = File(...),
    current_user: User | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Capture multi-angle face samples for a patient and store their embeddings.
    Accepts 1 or more image files.
    """
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required.")

    patient = _ensure_patient_record(db, current_user)
    db.commit()
    db.refresh(patient)

    if not files:
        raise HTTPException(status_code=400, detail="No face images provided.")

    saved_count = 0
    errors = []

    for file in files:
        contents = await file.read()
        if not contents:
            errors.append(f"{file.filename}: empty file")
            continue

        try:
            image_path = await save_face_image(file, patient.patient_code)
            embedding = face_service.build_embedding(contents)
            if embedding is None:
                errors.append(f"{file.filename}: face not detected or embedding failed")
                continue
            
            # Check if face is already registered to another patient
            is_dup, dup_patient_id, best_score = face_service.check_duplicate_face(
                embedding, db, exclude_patient_id=patient.id
            )
            if is_dup:
                dup_patient = db.query(Patient).filter(Patient.id == dup_patient_id).first()
                dup_code = dup_patient.patient_code if dup_patient else f"ID-{dup_patient_id}"
                raise HTTPException(
                    status_code=400,
                    detail=f"Face registration rejected: This face profile is already registered to another patient ({dup_code}). Duplicate face registration is not allowed."
                )

            embedding_blob = pickle.dumps(embedding)
            db.add(
                PatientFaceEmbedding(
                    patient_id=patient.id,
                    embedding=embedding_blob,
                    image_path=image_path,
                    quality_score=90,
                )
            )
            saved_count += 1
        except Exception as exc:
            errors.append(f"{file.filename}: {str(exc)}")

    if saved_count == 0:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process face images. Errors: {'; '.join(errors)}"
        )

    db.commit()
    total_samples = db.query(PatientFaceEmbedding).filter(PatientFaceEmbedding.patient_id == patient.id).count()

    return {
        "message": f"Successfully processed {saved_count} face sample(s).",
        "sample_count": total_samples,
        "minimum_required": settings.FACE_MIN_ENROLLMENT_SAMPLES,
        "is_enrolled": total_samples >= settings.FACE_MIN_ENROLLMENT_SAMPLES,
        "warnings": errors if errors else None
    }


@router.post("/face-login")
async def face_login(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Authenticate a patient via multi-frame face recognition and consensus voting.
    Accepts one or multiple image frames.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No face images provided.")

    frame_embeddings = []
    for file in files:
        contents = await file.read()
        if contents:
            emb = face_service.build_embedding(contents)
            if emb is not None:
                frame_embeddings.append(emb)

    if not frame_embeddings:
        raise HTTPException(
            status_code=400,
            detail="Could not detect face in any of the captured frames. Please ensure your face is clearly visible and well-lit."
        )

    candidates = (
        db.query(PatientFaceEmbedding)
        .join(Patient)
        .filter(Patient.user_id.isnot(None))
        .all()
    )

    if not candidates:
        raise HTTPException(
            status_code=401,
            detail="No faces have been enrolled yet. Please log in with your email and password first, then go to Face Enrollment to set up face login."
        )

    matched_patient_id, confidence_score = face_service.multi_frame_consensus(
        frame_embeddings=frame_embeddings,
        candidates=candidates,
        threshold=settings.FACE_RECOGNITION_THRESHOLD,
        consensus_ratio=settings.FACE_LOGIN_CONSENSUS_RATIO
    )

    if matched_patient_id is None:
        raise HTTPException(
            status_code=401,
            detail=f"Face recognition match failed. Confidence did not meet required security threshold ({settings.FACE_RECOGNITION_THRESHOLD})."
        )

    patient = db.query(Patient).filter(Patient.id == matched_patient_id).first()
    if not patient or not patient.user_id:
        raise HTTPException(status_code=401, detail="No linked account found for the recognized face.")

    user = db.query(User).filter(User.id == patient.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive.")

    user.last_login_at = datetime.now(timezone.utc)
    access_token = create_access_token({"sub": str(user.id), "role": user.role.name})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    db.add(
        UserSession(
            user_id=user.id,
            refresh_token=refresh_token,
            device_info="face-login-multiframe",
            ip_address=None,
            is_active=True,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()

    logger.info(f"Multi-frame face login successful for user {user.email} (Confidence: {confidence_score:.4f})")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset OTP."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Don't reveal user existence
        return {"message": "If an account exists with this email, an OTP has been sent."}

    await create_and_send_otp(db, email=user.email, purpose="forgot_password", user_id=user.id)
    return {"message": "Password reset OTP sent to your email."}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using OTP code."""
    success, msg = verify_otp_code(db, email=req.email, code=req.code, purpose="forgot_password")
    if not success:
        raise HTTPException(status_code=400, detail=msg)

    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(req.new_password)
    db.commit()

    create_audit_log(db, user_id=user.id, action="reset_password", resource="users", resource_id=user.id)
    return {"message": "Password reset successful. You can now log in with your new password."}


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password for current logged-in user."""
    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    current_user.password_hash = hash_password(req.new_password)
    db.commit()

    create_audit_log(db, user_id=current_user.id, action="change_password", resource="users", resource_id=current_user.id)
    return {"message": "Password updated successfully."}
