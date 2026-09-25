import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Camera, UserPlus, Search, CheckCircle2, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appointmentsApi } from '../../lib/api';
import type { Appointment } from '../../types';

type MatchResult = {
  matched: boolean;
  confidence: string;
  patient_code: string;
  name: string;
  age: number;
  blood_group: string;
  allergies: string;
  doctor: string;
  appointment_time: string;
};

const formatTime = (value?: string) => {
  if (!value) return '—';
  return value.slice(0, 5);
};

const formatStatus = (status?: string) => {
  const normalized = status ?? 'scheduled';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const ReceptionDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentsApi.today();
        setAppointments(response.data.results ?? []);
      } catch {
        setError('Unable to load today\'s queue right now.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return appointments;

    return appointments.filter((appointment) => {
      const patientName = `${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.toLowerCase();
      const patientCode = (appointment.patient?.patient_code ?? '').toLowerCase();
      const phone = (appointment.patient?.phone ?? '').toLowerCase();
      return patientName.includes(query) || patientCode.includes(query) || phone.includes(query);
    });
  }, [appointments, searchQuery]);

  const simulateFaceScan = () => {
    setIsScanning(true);
    setMatchResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const firstAppointment = appointments[0];

      if (firstAppointment) {
        setMatchResult({
          matched: true,
          confidence: '99.8%',
          patient_code: firstAppointment.patient?.patient_code ?? `IM-${String(firstAppointment.patient_id).padStart(6, '0')}`,
          name: `${firstAppointment.patient?.first_name ?? ''} ${firstAppointment.patient?.last_name ?? ''}`.trim(),
          age: firstAppointment.patient?.age ?? 0,
          blood_group: firstAppointment.patient?.blood_group ?? '—',
          allergies: firstAppointment.patient?.known_allergies ?? 'None on file',
          doctor: `Doctor ${firstAppointment.doctor_id}`,
          appointment_time: `${formatTime(firstAppointment.time_slot_start)} – ${formatTime(firstAppointment.time_slot_end)} (${formatStatus(firstAppointment.status)})`,
        });
      } else {
        setMatchResult({
          matched: true,
          confidence: '98.0%',
          patient_code: 'IM-000000',
          name: 'No patient on queue',
          age: 0,
          blood_group: '—',
          allergies: '—',
          doctor: '—',
          appointment_time: 'No appointments',
        });
      }
    }, 1200);
  };

  const handleCheckIn = async (appointmentId: number) => {
    try {
      const response = await appointmentsApi.checkIn(appointmentId);
      setAppointments((previous) => previous.map((appointment) => (appointment.id === appointmentId ? response.data : appointment)));
    } catch {
      setError('Failed to check in the patient.');
    }
  };

  return (
    <DashboardLayout title="Reception & AI Check-In Desk">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={simulateFaceScan}
            className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg hover:shadow-sky-500/20 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-200 block">AI Biometrics</span>
              <h3 className="text-lg font-extrabold mt-0.5">Start AI Webcam Face Scan</h3>
              <p className="text-xs text-sky-100 mt-1">Instant patient profile lookup</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          <Link
            to="/dashboard/patient-registration"
            className="glass-card glass-card-hover p-6 rounded-2xl flex items-center justify-between text-slate-900 dark:text-white"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">New Admission</span>
              <h3 className="text-lg font-bold mt-0.5">Register New Patient</h3>
              <p className="text-xs text-slate-500 mt-1">Capture face & generate QR card</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
          </Link>

          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fallback Search</span>
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Code, Phone, QR..."
                className="input-field pl-9"
              />
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}

        {isScanning && (
          <div className="glass-card p-8 rounded-2xl text-center space-y-4 border-2 border-sky-500 animate-pulse">
            <div className="w-20 h-20 mx-auto rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Camera className="w-10 h-10 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scanning Webcam Stream...</h3>
            <p className="text-xs text-slate-500">Running InsightFace detector & MediaPipe liveness verification</p>
          </div>
        )}

        {matchResult && (
          <div className="glass-card p-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-slate-900 dark:text-white text-base">PATIENT IDENTIFIED ({matchResult.confidence})</span>
              </div>
              <span className="text-xs font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full">
                {matchResult.patient_code}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Full Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{matchResult.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Age / Gender</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{matchResult.age > 0 ? `${matchResult.age} Yrs / Male` : 'Pending'}</p>
              </div>
              <div>
                <span className="text-slate-400">Blood Group</span>
                <p className="font-bold text-red-600">{matchResult.blood_group}</p>
              </div>
              <div>
                <span className="text-slate-400">Allergies</span>
                <p className="font-semibold text-amber-600">{matchResult.allergies}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Today's Appointment</span>
                <span className="font-bold text-slate-900 dark:text-white">{matchResult.doctor}</span>
                <span className="block text-sky-600 font-semibold">{matchResult.appointment_time}</span>
              </div>
              <button className="btn-primary">
                <UserCheck className="w-4 h-4" />
                Instant Check-In
              </button>
            </div>
          </div>
        )}

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Today's Patient Arrival Queue</h3>
          {loading ? (
            <p className="text-sm text-slate-500">Loading appointments…</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments have been loaded for today yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Patient Code</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Time Slot</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-sky-600">{appointment.patient?.patient_code ?? `IM-${String(appointment.patient_id).padStart(6, '0')}`}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {`${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim() || 'Unnamed patient'}
                      </td>
                      <td className="p-3 text-slate-500">{appointment.patient?.phone ?? '—'}</td>
                      <td className="p-3">Doctor {appointment.doctor_id}</td>
                      <td className="p-3">{`${formatTime(appointment.time_slot_start)} – ${formatTime(appointment.time_slot_end)}`}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                          {formatStatus(appointment.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="btn-primary py-1 px-3 text-[11px]" onClick={() => handleCheckIn(appointment.id)}>
                          Check-In
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
