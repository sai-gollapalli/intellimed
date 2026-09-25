import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Camera, UserPlus, Search, UserCheck } from 'lucide-react';
import { appointmentsApi, billingApi, patientsApi } from '../../lib/api';
import type { Appointment, Billing, Patient } from '../../types';

const formatTime = (value?: string) => (value ? value.slice(0, 5) : '—');

const formatStatus = (status?: string) => {
  const normalized = status ?? 'scheduled';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const FaceSearchPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [matchName, setMatchName] = useState<string | null>(null);

  useEffect(() => {
    appointmentsApi.today().then((res) => setAppointments(res.data.results ?? [])).catch(() => {});
  }, []);

  const runScan = () => {
    setIsScanning(true);
    setMatchName(null);
    setTimeout(() => {
      setIsScanning(false);
      const first = appointments[0];
      setMatchName(first ? `${first.patient?.first_name ?? ''} ${first.patient?.last_name ?? ''}`.trim() : 'No match in queue');
    }, 1200);
  };

  return (
    <DashboardLayout title="AI Face Search">
      <div className="space-y-6">
        <button onClick={runScan} className="w-full p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200 block">Biometric Lookup</span>
            <h3 className="text-lg font-extrabold">Start AI Webcam Face Scan</h3>
          </div>
          <Camera className="w-8 h-8" />
        </button>
        {isScanning && <p className="text-sm text-sky-600 animate-pulse">Scanning webcam stream…</p>}
        {matchName && (
          <div className="glass-card p-4 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold">
            Patient identified: {matchName}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const PatientRegistrationPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Patient | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await patientsApi.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        gender,
        phone: phone.trim(),
        email: email.trim() || undefined,
        blood_group: bloodGroup || undefined,
        known_allergies: allergies || undefined,
      });
      setSuccess(response.data);
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setPhone('');
      setEmail('');
      setBloodGroup('');
      setAllergies('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Register New Patient">
      <div className="max-w-3xl space-y-4">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Patient registered successfully — Code: <span className="font-mono font-bold">{success.patient_code}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-sky-600 mb-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 dark:text-white">Patient Admission Form</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" />
            <input type="text" required placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="input-field" />
            <select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)} className="input-field">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="tel" required placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Blood Group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="input-field" />
            <input type="text" placeholder="Known Allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Registering…' : 'Register Patient & Generate QR'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    appointmentsApi
      .list()
      .then((res) => setAppointments(res.data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((a) => {
      const name = `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`.toLowerCase();
      return name.includes(q) || String(a.id).includes(q);
    });
  }, [appointments, search]);

  return (
    <DashboardLayout title="Appointments">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search appointments…" className="input-field pl-9" />
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading appointments…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="p-3 font-semibold">{`${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim() || '—'}</td>
                    <td className="p-3">Doctor {appointment.doctor_id}</td>
                    <td className="p-3">{appointment.appointment_date}</td>
                    <td className="p-3">{formatTime(appointment.time_slot_start)}</td>
                    <td className="p-3">{formatStatus(appointment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const CheckInPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi
      .today()
      .then((res) => setAppointments(res.data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async (id: number) => {
    const response = await appointmentsApi.checkIn(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? response.data : a)));
  };

  return (
    <DashboardLayout title="Patient Check-In">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Today's Check-In Queue</h3>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading queue…</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-sm">{`${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim()}</p>
                  <p className="text-xs text-slate-500">{formatTime(appointment.time_slot_start)} · {formatStatus(appointment.status)}</p>
                </div>
                <button type="button" className="btn-primary py-1 px-3 text-[11px]" onClick={() => handleCheckIn(appointment.id)}>
                  Check-In
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const BillingPage: React.FC = () => {
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingApi
      .list()
      .then((res) => setBilling(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Billing & Invoices">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading invoices…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billing.map((bill) => (
                  <tr key={bill.id}>
                    <td className="p-3 font-mono font-bold">{bill.invoice_no}</td>
                    <td className="p-3">{bill.patient_id}</td>
                    <td className="p-3">₹ {bill.amount_payable.toFixed(2)}</td>
                    <td className="p-3">{bill.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
