"""
IntelliMed - Database Seeder
Seeds the initial roles, default super admin, and department data.
Run: python -m database.seed   (from the intellimed/ root)
"""

import sys
import os

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database import SessionLocal, create_tables
from backend.models.role import Role
from backend.models.user import User
from backend.models.department import Department
from backend.utils.security import hash_password


# ── Role definitions ──────────────────────────────────────────────────────────

ROLES = [
    {
        "name": "super_admin",
        "display_name": "Super Administrator",
        "description": "Full system access across all hospitals and modules.",
        "permissions": [
            "manage_hospitals", "manage_roles", "manage_users",
            "view_audit_logs", "manage_settings", "view_all_data",
        ],
    },
    {
        "name": "hospital_admin",
        "display_name": "Hospital Administrator",
        "description": "Manages all hospital operations, staff, and analytics.",
        "permissions": [
            "manage_staff", "manage_doctors", "manage_departments",
            "view_billing", "view_reports", "manage_inventory",
        ],
    },
    {
        "name": "receptionist",
        "display_name": "Receptionist",
        "description": "Front-desk operations: patient registration, appointments, check-ins.",
        "permissions": [
            "register_patients", "book_appointments", "checkin_patients",
            "view_patients", "create_invoices", "face_search",
        ],
    },
    {
        "name": "doctor",
        "display_name": "Doctor",
        "description": "Clinical operations: consultations, prescriptions, lab orders.",
        "permissions": [
            "view_patients", "create_prescriptions", "order_lab_tests",
            "view_lab_reports", "update_medical_history", "view_appointments",
        ],
    },
    {
        "name": "lab_technician",
        "display_name": "Lab Technician",
        "description": "Processes lab test orders and uploads reports.",
        "permissions": [
            "view_lab_orders", "upload_lab_reports", "update_lab_status",
            "view_patients",
        ],
    },
    {
        "name": "pharmacist",
        "display_name": "Pharmacist",
        "description": "Dispenses medicines and manages pharmacy inventory.",
        "permissions": [
            "view_prescriptions", "dispense_medicines", "manage_inventory",
            "view_patients",
        ],
    },
    {
        "name": "patient",
        "display_name": "Patient",
        "description": "Self-service patient portal access.",
        "permissions": [
            "view_own_appointments", "view_own_prescriptions",
            "view_own_lab_reports", "view_own_billing", "book_appointments",
        ],
    },
]


# ── Department definitions ────────────────────────────────────────────────────

DEPARTMENTS = [
    {"name": "Cardiology",              "description": "Heart and cardiovascular system care.",                    "icon": "heart"},
    {"name": "Neurology",               "description": "Brain, spinal cord and nervous system disorders.",         "icon": "brain"},
    {"name": "Orthopedics",             "description": "Bone, joint, and musculoskeletal conditions.",            "icon": "bone"},
    {"name": "Pediatrics",              "description": "Medical care for infants, children, adolescents.",        "icon": "baby"},
    {"name": "Oncology",                "description": "Diagnosis and treatment of cancer.",                       "icon": "ribbon"},
    {"name": "Dermatology",             "description": "Skin, hair, and nail conditions.",                         "icon": "sparkles"},
    {"name": "Ophthalmology",           "description": "Eye and vision care.",                                    "icon": "eye"},
    {"name": "ENT (Otolaryngology)",    "description": "Ear, Nose, and Throat disorders.",                        "icon": "ear"},
    {"name": "Gastroenterology",        "description": "Digestive system disorders.",                             "icon": "activity"},
    {"name": "Radiology",               "description": "Medical imaging: X-ray, CT, MRI, Ultrasound.",           "icon": "scan"},
    {"name": "Laboratory",              "description": "Pathology and clinical lab services.",                    "icon": "flask"},
    {"name": "Emergency & Trauma",     "description": "24/7 emergency and critical care.",                       "icon": "ambulance"},
    {"name": "General Medicine",        "description": "Primary care and general health consultations.",        "icon": "stethoscope"},
    {"name": "Pharmacy",                "description": "Medicine dispensing and clinical pharmacy.",              "icon": "pill"},
    {"name": "Pulmonology",             "description": "Respiratory and lung disorders.",                         "icon": "lungs"},
    {"name": "Nephrology",              "description": "Kidney and urinary system disorders.",                    "icon": "droplet"},
    {"name": "Endocrinology",           "description": "Hormonal and metabolic disorders.",                       "icon": "activity"},
    {"name": "Rheumatology",           "description": "Autoimmune and musculoskeletal diseases.",               "icon": "bone"},
    {"name": "Hematology",              "description": "Blood disorders and blood cancers.",                      "icon": "droplet"},
    {"name": "Infectious Diseases",     "description": "Treatment of infectious and tropical diseases.",         "icon": "shield"},
    {"name": "Psychiatry",              "description": "Mental health and behavioral disorders.",                "icon": "brain"},
    {"name": "Obstetrics & Gynecology", "description": "Women's health, pregnancy, and childbirth.",             "icon": "baby"},
    {"name": "Urology",                 "description": "Urinary tract and male reproductive system.",            "icon": "activity"},
    {"name": "Surgery - General",       "description": "General surgical procedures.",                           "icon": "scissors"},
    {"name": "Surgery - Cardiovascular","description": "Heart and vascular surgery.",                              "icon": "heart"},
    {"name": "Surgery - Neurosurgery",  "description": "Brain and spinal cord surgery.",                          "icon": "brain"},
    {"name": "Anesthesiology",          "description": "Anesthesia and pain management.",                         "icon": "activity"},
    {"name": "Physical Therapy",        "description": "Rehabilitation and physical medicine.",                   "icon": "activity"},
    {"name": "Nutrition & Dietetics",   "description": "Clinical nutrition and dietary counseling.",              "icon": "apple"},
    {"name": "Palliative Care",         "description": "Comfort care for serious illnesses.",                      "icon": "heart"},
]


# ── Seeder functions ──────────────────────────────────────────────────────────

def seed_roles(db: Session) -> dict:
    """Seed all roles and return a name → Role mapping."""
    print("  Seeding roles...")
    role_map = {}
    for role_data in ROLES:
        existing = db.query(Role).filter(Role.name == role_data["name"]).first()
        if existing:
            role_map[existing.name] = existing
            print(f"    [SKIP] Role '{existing.name}' already exists.")
        else:
            role = Role(**role_data)
            db.add(role)
            db.flush()
            role_map[role.name] = role
            print(f"    [OK]   Role '{role.name}' created.")
    db.commit()
    return role_map


def seed_departments(db: Session):
    """Seed hospital departments."""
    print("  Seeding departments...")
    for dept_data in DEPARTMENTS:
        existing = db.query(Department).filter(Department.name == dept_data["name"]).first()
        if existing:
            print(f"    [SKIP] Department '{existing.name}' already exists.")
        else:
            dept = Department(**dept_data, is_active=True)
            db.add(dept)
            print(f"    [OK]   Department '{dept.name}' created.")
    db.commit()


def seed_super_admin(db: Session, role_map: dict):
    """Seed a default super admin account if none exists."""
    print("  Seeding super admin...")
    sa_role = role_map.get("super_admin")
    if not sa_role:
        print("    [SKIP] super_admin role not found.")
        return

    existing = db.query(User).filter(User.email == "admin@intellimed.local").first()
    if existing:
        print("    [SKIP] Super admin already exists.")
        return

    admin = User(
        email="admin@intellimed.local",
        password_hash=hash_password("Admin@123"),
        first_name="Super",
        last_name="Admin",
        phone="+91-0000000000",
        role_id=sa_role.id,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.commit()
    print("    [OK]   Super admin created  ->  admin@intellimed.local / Admin@123")


def run_seed():
    """Execute the full database seed sequence."""
    print("\n==========================================")
    print("  IntelliMed -- Database Seeder")
    print("==========================================")

    print("\n[1/3] Creating tables if not present...")
    try:
        create_tables()
        print("  Tables ready.")
    except Exception as e:
        print(f"  ERROR creating tables: {e}")
        sys.exit(1)

    db: Session = SessionLocal()
    try:
        print("\n[2/3] Seeding core data...")
        role_map = seed_roles(db)
        seed_departments(db)

        print("\n[3/3] Seeding default users...")
        seed_super_admin(db, role_map)

        print("\n==========================================")
        print("  Seed complete! OK")
        print("==========================================\n")
    except Exception as e:
        db.rollback()
        print(f"\n  ERROR during seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
