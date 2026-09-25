import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models.role import Role
from backend.models.user import User
from backend.schemas.auth import UserCreate
from backend.services.auth_service import normalize_email, register_user


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        role = Role(name="patient", display_name="Patient", description="")
        session.add(role)
        session.commit()
        yield session
    finally:
        session.close()


def test_normalize_email_lowercases_and_strips_whitespace():
    assert normalize_email("  User@Example.com  ") == "user@example.com"


def test_register_user_normalizes_email_before_duplicate_check(db_session):
    first = UserCreate(
        email="User@Example.com",
        first_name="First",
        last_name="User",
        phone="1234567890",
        password="secret123",
        role_name="patient",
    )
    second = UserCreate(
        email="user@example.com",
        first_name="Second",
        last_name="User",
        phone="1234567890",
        password="secret123",
        role_name="patient",
    )

    first_user = register_user(db_session, first)
    assert first_user.email == "user@example.com"

    with pytest.raises(Exception):
        register_user(db_session, second)


def test_user_response_with_doctor_profile_validation():
    from backend.models.doctor import Doctor
    from backend.schemas.auth import UserResponse
    from datetime import datetime, timezone

    role = Role(id=1, name="doctor", display_name="Doctor", description="Doctor", permissions=[], created_at=datetime.now(timezone.utc))
    doctor_obj = Doctor(id=1, user_id=1, department_id=1, specialization="Cardiology", qualification="MD", license_no="DOC-101")
    user_obj = User(
        id=1,
        email="doctor@example.com",
        first_name="John",
        last_name="Doe",
        role=role,
        doctor_profile=doctor_obj,
        is_active=True,
        is_verified=True,
        created_at=datetime.now(timezone.utc)
    )

    response = UserResponse.model_validate(user_obj)
    assert response.doctor_profile is not None
    assert response.doctor_profile.specialization == "Cardiology"
    assert response.doctor_profile.license_no == "DOC-101"


def test_face_service_basic_features_discrimination():
    import io
    from PIL import Image
    from backend.services.face_service import face_service

    img_red = Image.new("RGB", (128, 128), color="red")
    img_red2 = Image.new("RGB", (128, 128), color="red")
    img_blue = Image.new("RGB", (128, 128), color="blue")

    b_red = io.BytesIO()
    img_red.save(b_red, format="JPEG")
    b_red2 = io.BytesIO()
    img_red2.save(b_red2, format="JPEG")
    b_blue = io.BytesIO()
    img_blue.save(b_blue, format="JPEG")

    emb_red = face_service.build_embedding(b_red.getvalue())
    emb_red2 = face_service.build_embedding(b_red2.getvalue())
    emb_blue = face_service.build_embedding(b_blue.getvalue())

    assert emb_red is not None
    assert emb_red2 is not None
    assert emb_blue is not None

    same_sim = face_service.cosine_similarity(emb_red, emb_red2)
    diff_sim = face_service.cosine_similarity(emb_red, emb_blue)

    assert same_sim > 0.95
    assert diff_sim < 0.60


def test_check_duplicate_face_prevents_duplicate_registration(db_session):
    import pickle
    from backend.models.patient import Patient
    from backend.models.patient_face_embedding import PatientFaceEmbedding
    from backend.services.face_service import face_service

    # Create two patients in DB
    from datetime import date
    p1 = Patient(patient_code="IM-000001", first_name="Alice", last_name="Smith", date_of_birth=date(1990, 1, 1), gender="Female", phone="1111111111")
    p2 = Patient(patient_code="IM-000002", first_name="Bob", last_name="Jones", date_of_birth=date(1992, 2, 2), gender="Male", phone="2222222222")
    db_session.add_all([p1, p2])
    db_session.commit()

    # Enroll face embedding for patient 1
    dummy_embedding = [0.1] * 1072
    p1_embedding = PatientFaceEmbedding(patient_id=p1.id, embedding=pickle.dumps(dummy_embedding), quality_score=90)
    db_session.add(p1_embedding)
    db_session.commit()

    # Check same face for patient 2 -> should return is_duplicate = True matching patient 1
    is_dup, matched_id, score = face_service.check_duplicate_face(dummy_embedding, db_session, exclude_patient_id=p2.id)
    assert is_dup is True
    assert matched_id == p1.id
    assert score > 0.99

    # Check same face excluding patient 1 -> should return is_duplicate = False
    is_dup_self, _, _ = face_service.check_duplicate_face(dummy_embedding, db_session, exclude_patient_id=p1.id)
    assert is_dup_self is False


