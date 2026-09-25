export type RoleName = 
  | 'super_admin' 
  | 'hospital_admin' 
  | 'receptionist' 
  | 'doctor' 
  | 'lab_technician' 
  | 'pharmacist' 
  | 'patient';

export interface Role {
  id: number;
  name: RoleName;
  display_name: string;
  description?: string;
  permissions: string[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: Role;
  is_active: boolean;
  is_verified: boolean;
  avatar_path?: string;
  last_login_at?: string;
  created_at: string;
  doctor_profile?: Doctor;
}

export interface Patient {
  id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age?: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  photo_path?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  blood_group?: string;
  height?: number;
  weight?: number;
  known_allergies?: string;
  medical_history_summary?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  insurance_provider?: string;
  insurance_policy_no?: string;
  qr_code_path?: string;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  head_doctor_id?: number;
  is_active: boolean;
}

export interface Doctor {
  id: number;
  user_id: number;
  user?: User;
  department_id: number;
  department?: Department;
  specialization: string;
  qualification?: string;
  license_no: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string;
  is_available: boolean;
}

export interface Appointment {
  id: number;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  department_id: number;
  department?: Department;
  appointment_date: string;
  time_slot_start: string;
  time_slot_end: string;
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
  appointment_type: string;
  reason?: string;
  notes?: string;
  check_in_time?: string;
  check_out_time?: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  medicine_id?: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  prescription_code: string;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  doctor?: Doctor;
  medicines: PrescriptionMedicine[];
  notes?: string;
  pdf_path?: string;
  is_dispensed: 'pending' | 'partial' | 'dispensed';
  created_at: string;
}

export interface LabReportResult {
  parameter: string;
  value: string;
  unit: string;
  normal_range: string;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface LabReport {
  id: number;
  report_code: string;
  patient_id: number;
  patient?: Patient;
  doctor_id: number;
  report_type: string;
  test_name: string;
  results: LabReportResult[];
  status: 'pending' | 'completed';
  pdf_path?: string;
  created_at: string;
}

export interface BillingItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Billing {
  id: number;
  invoice_no: string;
  patient_id: number;
  patient?: Patient;
  items: BillingItem[];
  subtotal: number;
  discount: number;
  gst_percent: number;
  gst_amount: number;
  total: number;
  insurance_claim: number;
  amount_payable: number;
  status: 'unpaid' | 'partial' | 'paid';
  pdf_path?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
