import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FileText, FlaskConical } from 'lucide-react';
import { appointmentsApi } from '../../lib/api';
import type { Appointment } from '../../types';

const formatTime = (value?: string) => {
  if (!value) return '—';
  return value.slice(0, 5);
};

const formatStatus = (status?: string) => {
  const normalized = status ?? 'scheduled';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeAppointmentId, setActiveAppointmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentsApi.today();
        setAppointments(response.data.results ?? []);
      } catch {
        setError('Unable to load the care queue right now.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    if (appointments.length > 0 && activeAppointmentId === null) {
      setActiveAppointmentId(appointments[0].id);
    }
    if (appointments.length === 0) {
      setActiveAppointmentId(null);
    }
  }, [activeAppointmentId, appointments]);

  const activeAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === activeAppointmentId) ?? appointments[0] ?? null,
    [activeAppointmentId, appointments]
  );

  const waitingCount = appointments.filter((appointment) => appointment.status === 'scheduled' || appointment.status === 'checked_in').length;
  const completedCount = appointments.filter((appointment) => appointment.status === 'completed').length;
  const checkedInCount = appointments.filter((appointment) => appointment.status === 'checked_in' || appointment.status === 'in_progress').length;

  const handleCheckIn = async (appointmentId: number) => {
    try {
      const response = await appointmentsApi.checkIn(appointmentId);
      setAppointments((previous) => previous.map((appointment) => (appointment.id === appointmentId ? response.data : appointment)));
    } catch {
      setError('Could not update the patient status.');
    }
  };

  const handleComplete = async (appointmentId: number) => {
    try {
      const response = await appointmentsApi.complete(appointmentId);
      setAppointments((previous) => previous.map((appointment) => (appointment.id === appointmentId ? response.data : appointment)));
    } catch {
      setError('Could not mark the consultation as complete.');
    }
  };

  return (
    <DashboardLayout title="Doctor Clinical Console">
      <div className="space-y-6">
        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500">
            <p className="text-xs text-slate-500 font-medium">Today's Appointments</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{appointments.length}</p>
            <span className="text-[10px] text-sky-600 font-semibold mt-1 block">{waitingCount} Patients Waiting</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500 font-medium">Checked In</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{checkedInCount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Ready for Consultation</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-amber-500">
            <p className="text-xs text-slate-500 font-medium">Completed Consultations</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{completedCount}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Prescriptions and Notes Logged</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Waiting Consultation Queue</h3>
            {loading ? (
              <p className="text-sm text-slate-500">Loading patient queue…</p>
            ) : appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No appointments are scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => {
                  const patientName = `${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim();
                  const isActive = appointment.id === activeAppointment?.id;
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => setActiveAppointmentId(appointment.id)}
                      className={`w-full text-left p-3.5 rounded-xl border space-y-2 ${isActive ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{patientName || 'Unnamed patient'}</h4>
                          <span className="text-xs text-sky-600 font-mono font-bold">{appointment.patient?.patient_code ?? `IM-${String(appointment.patient_id).padStart(6, '0')}`}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${appointment.status === 'checked_in' ? 'bg-emerald-500 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
                          {formatStatus(appointment.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{appointment.reason ?? 'Routine consultation'}</p>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span>{appointment.patient?.age ? `Age: ${appointment.patient.age}` : 'Age: —'}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatTime(appointment.time_slot_start)} Slot</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4 col-span-2">
            {activeAppointment ? (
              <>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-400">Active Patient Consultation</span>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {`${activeAppointment.patient?.first_name ?? ''} ${activeAppointment.patient?.last_name ?? ''}`.trim() || 'Unnamed patient'}
                      {' '}({activeAppointment.patient?.patient_code ?? `IM-${String(activeAppointment.patient_id).padStart(6, '0')}`})
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                    Allergies: {activeAppointment.patient?.known_allergies ?? 'None on file'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">Appointment</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{formatTime(activeAppointment.time_slot_start)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{formatStatus(activeAppointment.status)}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{activeAppointment.patient?.phone ?? '—'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block">Reason</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{activeAppointment.reason ?? 'Routine'}</span>
                  </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Diagnosis & ICD Code</label>
                    <input type="text" placeholder="e.g. Essential Hypertension (ICD-10 I10)" className="input-field" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor Notes & Observations</label>
                    <textarea rows={3} placeholder="Record patient symptoms, physical examination findings..." className="input-field"></textarea>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" className="btn-primary flex-1" onClick={() => handleComplete(activeAppointment.id)}>
                      <FileText className="w-4 h-4" />
                      Mark Consultation Complete
                    </button>
                    <button type="button" className="btn-outline" onClick={() => handleCheckIn(activeAppointment.id)}>
                      <FlaskConical className="w-4 h-4" />
                      Check In Patient
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a patient from the queue to begin the consultation view.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
