import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, AlertCircle, Stethoscope, User, Building2, GraduationCap, CheckCircle2, ShieldCheck, Calendar, DollarSign } from 'lucide-react';
import api from '../lib/axios';
import { departmentsApi } from '../lib/api';
import type { Department } from '../types';

const getErrorMessage = (err: any): string => {
  const data = err?.response?.data;

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail.map((item: any) => item?.msg || item?.message || 'Validation failed').join(', ');
  }

  if (data?.detail && typeof data.detail === 'object') {
    return data.detail.msg || 'Registration failed. Please check your information.';
  }

  return 'Registration failed. Please check your information.';
};

export const StaffRegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('doctor');
  const [departmentId, setDepartmentId] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Load departments on mount
  React.useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepts(true);
      try {
        const response = await departmentsApi.list();
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoadingDepts(false);
      }
    };
    loadDepartments();
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault?.();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (role === 'doctor' && (!departmentId || !specialization || !qualification || !licenseNumber)) {
      setError('Please fill in all doctor-specific fields.');
      return;
    }

    setLoading(true);

    try {
      const staffData: any = {
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password,
        role_name: role,
      };

      // Add doctor-specific fields if role is doctor
      if (role === 'doctor') {
        staffData.department_id = parseInt(departmentId);
        staffData.specialization = specialization;
        staffData.qualification = qualification;
        staffData.license_number = licenseNumber;
        staffData.experience_years = parseInt(experience) || 0;
        staffData.consultation_fee = parseFloat(consultationFee) || 0;
      } else if (departmentId) {
        staffData.department_id = parseInt(departmentId);
      }

      await api.post('/auth/register-staff', staffData);

      // Redirect to staff login
      navigate('/staff-login', { 
        state: { message: 'Staff registration successful. Please login with your credentials.' }
      });
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/60 dark:from-slate-900/80 dark:via-slate-900 dark:to-teal-950/40 medical-pattern flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Logo Header */}
        <div className="text-center space-y-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-teal-600/30">
              <Activity className="w-9 h-9" />
            </div>
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Intelli<span className="text-teal-600">Med</span>
            </span>
          </Link>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Hospital Staff Registration</h2>
            <p className="text-base text-slate-500">Join our healthcare team and make a difference in patient care</p>
          </div>
          
          {/* Role badges */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <div className="px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Doctors
            </div>
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Administrators
            </div>
            <div className="px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Support Staff
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-2xl space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-teal-100 dark:border-teal-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-slate-500">Basic contact details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@intellimed.local"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-teal-100 dark:border-teal-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Role & Department</h3>
                  <p className="text-xs text-slate-500">Select your position and department</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="hospital_admin">Hospital Admin</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="lab_technician">Lab Technician</option>
                    <option value="pharmacist">Pharmacist</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="input-field"
                    disabled={loadingDepts}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Doctor-specific fields */}
            {isDoctor && (
              <div className="space-y-5 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-2 border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-3 pb-3 border-b border-teal-200 dark:border-teal-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-teal-800 dark:text-teal-200">Doctor Credentials</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400">Professional qualifications and details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
                    <input
                      type="text"
                      required={isDoctor}
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Cardiology"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Qualification</label>
                    <input
                      type="text"
                      required={isDoctor}
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="MBBS, MD"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">License Number</label>
                    <input
                      type="text"
                      required={isDoctor}
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="MED-12345"
                      className="input-field"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-500" />
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      required={isDoctor}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="5"
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    required={isDoctor}
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="500"
                    min="0"
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Password Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-teal-100 dark:border-teal-800">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security</h3>
                  <p className="text-xs text-slate-500">Create a secure password</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button type="button" onClick={() => void handleSubmit()} disabled={loading} className="w-full btn-primary py-4 text-base font-semibold">
              {loading ? 'Creating Staff Account...' : 'Register Staff Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center pt-6 border-t border-teal-100 dark:border-teal-800">
            <div className="text-sm text-slate-500 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Already have a staff account?</span>
                <Link to="/staff-login" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                  Staff Login
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>Looking for patient registration?</span>
                <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline">
                  Patient Registration
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
