import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Calendar, FileText, Pill, CreditCard, Download, QrCode, Plus, X, HeartPulse, Activity, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentsApi, billingApi, labReportsApi, prescriptionsApi, departmentsApi, staffApi, patientsApi } from '../../lib/api';
import type { Appointment, Billing, LabReport, Prescription, Department, Doctor } from '../../types';

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

export const PatientPortal: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctor_id: '',
    department_id: '',
    appointment_date: '',
    time_slot_start: '',
    time_slot_end: '',
    reason: '',
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        const [appointmentsResponse, prescriptionsResponse, labReportsResponse, billingResponse, deptResponse, staffResponse, myProfileResponse] = await Promise.all([
          appointmentsApi.list(),
          prescriptionsApi.list(),
          labReportsApi.list(),
          billingApi.list(),
          departmentsApi.list(),
          staffApi.list({ role: 'doctor' }),
          patientsApi.myProfile().catch(() => null),
        ]);

        setAppointments(appointmentsResponse.data.results ?? []);
        setPrescriptions(Array.isArray(prescriptionsResponse.data) ? prescriptionsResponse.data : []);
        setLabReports(Array.isArray(labReportsResponse.data) ? labReportsResponse.data : []);
        setBilling(Array.isArray(billingResponse.data) ? billingResponse.data : []);
        setDepartments(deptResponse.data);
        
        // Extract doctors from staff
        const doctorsList = staffResponse.data
          .filter((staff: any) => staff.doctor_profile)
          .map((staff: any) => staff.doctor_profile);
        setDoctors(doctorsList);
        
        // Set patient ID from actual patient profile
        if (myProfileResponse?.data?.id) {
          setPatientId(myProfileResponse.data.id);
        } else if (user?.id) {
          setPatientId(user.id);
        }
      } catch {
        setError('Unable to load your medical records right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [user]);

  const upcomingAppointment = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];
  }, [appointments]);

  const totalOutstanding = billing.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount_payable), 0);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(false);

    try {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: parseInt(bookingForm.doctor_id),
        department_id: parseInt(bookingForm.department_id),
        appointment_date: bookingForm.appointment_date,
        time_slot_start: bookingForm.time_slot_start,
        time_slot_end: bookingForm.time_slot_end,
        appointment_type: 'consultation',
        reason: bookingForm.reason,
      };

      await appointmentsApi.book(appointmentData);
      setBookingSuccess(true);
      setShowBookingModal(false);
      setBookingForm({
        doctor_id: '',
        department_id: '',
        appointment_date: '',
        time_slot_start: '',
        time_slot_end: '',
        reason: '',
      });

      // Reload appointments
      const appointmentsResponse = await appointmentsApi.list();
      setAppointments(appointmentsResponse.data.results ?? []);
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || 'Failed to book appointment. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Patient Health Portal">
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl shadow-teal-600/20">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-teal-100 block">Personal Health Record</span>
            <h2 className="text-2xl font-extrabold mt-0.5">Welcome, {user?.full_name}</h2>
            <p className="text-xs text-teal-100 mt-1">Patient Code: <span className="font-mono font-bold">{user?.id ? `IM-${String(user.id).padStart(6, '0')}` : 'IM-000001'}</span></p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-600 font-semibold text-sm flex items-center gap-2 hover:bg-teal-50 transition-colors shadow-lg"
            >
              <Activity className="w-4 h-4" />
              Book Appointment
            </button>
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md flex items-center gap-3 border border-white/30">
              <QrCode className="w-8 h-8 text-white" />
              <div>
                <span className="text-[10px] text-teal-100 block">Digital QR Card</span>
                <span className="text-xs font-bold text-white">Scan at Hospital Desk</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}
        {bookingSuccess && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Appointment booked successfully!</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card glass-card-hover p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Upcoming Visit</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{upcomingAppointment ? `${formatDate(upcomingAppointment.appointment_date)}, ${upcomingAppointment.time_slot_start?.slice(0, 5)}` : 'No upcoming visit'}</p>
              <span className="text-[10px] text-teal-600 font-semibold">{upcomingAppointment ? `Doctor ${upcomingAppointment.doctor_id}` : 'Book an appointment'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Lab Reports</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{labReports.length} Available</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{labReports[0]?.report_code ?? 'No report yet'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Prescriptions</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{prescriptions.length} Record(s)</p>
              <span className="text-[10px] text-cyan-600 font-semibold">{prescriptions[0]?.prescription_code ?? 'No prescription yet'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Invoices & Bills</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">₹ {totalOutstanding.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">{billing.length > 0 ? `${billing.length} invoice(s)` : 'No invoices yet'}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">My Medical Records & Downloads</h3>
          {loading ? (
            <p className="text-sm text-slate-500">Loading your records…</p>
          ) : (
            <div className="space-y-4 text-xs">
              {prescriptions.length === 0 && labReports.length === 0 && billing.length === 0 ? (
                <p className="text-sm text-slate-500">You do not have any medical records yet.</p>
              ) : (
                <>
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Prescription {prescription.prescription_code}</p>
                        <p className="text-slate-500 mt-0.5">{prescription.medicines?.length ?? 0} medicine item(s) • {prescription.is_dispensed}</p>
                      </div>
                      <button className="btn-outline text-xs">
                        <Download className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  ))}

                  {labReports.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{report.test_name} ({report.report_code})</p>
                        <p className="text-slate-500 mt-0.5">Status: {report.status} • {formatDate(report.created_at)}</p>
                      </div>
                      <button className="btn-outline text-xs">
                        <Download className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  ))}

                  {billing.map((bill) => (
                    <div key={bill.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Invoice {bill.invoice_no}</p>
                        <p className="text-slate-500 mt-0.5">Status: {bill.status} • Amount payable: ₹ {bill.amount_payable.toFixed(2)}</p>
                      </div>
                      <button className="btn-outline text-xs">
                        <Download className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Book Appointment</h3>
                <button onClick={() => setShowBookingModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {bookingError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{bookingError}</div>}

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    required
                    value={bookingForm.department_id}
                    onChange={(e) => {
                      setBookingForm({ ...bookingForm, department_id: e.target.value, doctor_id: '' });
                    }}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
                  <select
                    required
                    value={bookingForm.doctor_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
                    className="input-field"
                    disabled={!bookingForm.department_id}
                  >
                    <option value="">Select Doctor</option>
                    {doctors
                      .filter((doc) => doc.department_id === parseInt(bookingForm.department_id))
                      .map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.specialization} - {doc.user?.full_name || `Doctor ${doc.id}`}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.appointment_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={bookingForm.time_slot_start}
                      onChange={(e) => setBookingForm({ ...bookingForm, time_slot_start: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={bookingForm.time_slot_end}
                      onChange={(e) => setBookingForm({ ...bookingForm, time_slot_end: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Visit</label>
                  <textarea
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Describe your symptoms or reason for visit..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
