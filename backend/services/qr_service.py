"""
IntelliMed - QR Code Generator Service
Generates patient digital health card QR code PNG images.
"""

import os
import qrcode
from pathlib import Path
from backend.config import settings


def generate_patient_qr_code(patient_code: str, patient_name: str) -> str:
    """
    Generate a QR code image for a patient containing their code and verification payload.
    
    Args:
        patient_code: e.g. IM-000104
        patient_name: e.g. Alexander Wright
    
    Returns:
        Relative file path to saved QR code PNG
    """
    os.makedirs(settings.QR_CODES_DIR, exist_ok=True)

    # QR payload JSON-like string
    payload = f"INTELLIMED|PATIENT|{patient_code}|{patient_name}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0284c7", back_color="white")

    filename = f"qr_{patient_code}.png"
    file_path = os.path.join(settings.QR_CODES_DIR, filename)
    img.save(file_path)

    return f"qr_codes/{filename}"
