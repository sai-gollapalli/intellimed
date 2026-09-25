import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, UserCheck, Calendar, FileText, Pill, FlaskConical, ChevronRight, X, HeartPulse } from 'lucide-react';
import { patientsApi, appointmentsApi, prescriptionsApi, labReportsApi } from '../../lib/api';
import type { Patient, Appointment, Prescription, LabReport } from '../../types';

export const DoctorPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Patient Detail Modal / Drawer state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [patientLabReports, setPatientLabReports] = useState<LabReport[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPatients = async (query?: string) => {
    try {
      setLoading(true);
      const res = await patientsApi.search(query);
      setPatients(res.data.results ?? []);
    } catch {
      setError('Could not load patient directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setDetailLoading(true);
    try {
      const [apptRes, prescRes, labRes] = await Promise.all([
        appointmentsApi.list({ patient_id: patient.id }),
        prescriptionsApi.list({ patient_id: patient.id }),
        labReportsApi.list({ patient_id: patient.id }),
      ]);
      setPatientAppointments(apptRes.data.results ?? []);
      setPatientPrescriptions(Array.isArray(prescRes.data) ? prescRes.data : []);
      setPatientLabReports(Array.isArray(labRes.data) ? labRes.data : []);
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardLayout title="Doctor Patient Directory & Records">
      <div className="space-y-6">
        {/* Header / Search bar */}
        <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Records Directory</h2>
            <p className="text-xs text-slate-500 mt-1">Search, inspect EMR timeline, and view clinical history for hospital patients.</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search name, phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-xs"
              />
            </div>
            <button type="submit" className="btn-primary text-xs px-4 py-2">
              Search
            </button>
          </form>
        </div>

        {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>}

        {/* Patient Grid / Table */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">All Registered Hospital Patients</h3>
            <span className="text-xs text-slate-500 font-semibold">{patients.length} Patient(s) Found</span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 py-6 text-center">Loading patient records…</p>
          ) : patients.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No patient records found matching your search criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="glass-card glass-card-hover p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer space-y-3 transition-all hover:border-sky-400"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <span className="text-xs text-sky-600 font-mono font-bold">{patient.patient_code}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                      {patient.gender} • {patient.age ? `${patient.age} yrs` : 'Age N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-400">Phone</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{patient.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Blood Group</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{patient.blood_group || '—'}</span>
                    </div>
                  </div>

                  {patient.known_allergies && (
                    <div className="text-[10px] text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-900">
                      <strong>Allergies:</strong> {patient.known_allergies}
                    </div>
                  )}

                  <div className="flex items-center justify-end text-xs text-sky-600 font-semibold gap-1 pt-1">
                    <span>View Medical Records</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Patient Medical Records Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="p-5 bg-gradient-to-r from-sky-700 to-indigo-700 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-200">Patient Electronic Medical Record</span>
                  <h3 className="text-xl font-extrabold">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                  <span className="text-xs text-sky-100 font-mono font-bold">{selectedPatient.patient_code}</span>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
                {/* Vitals & Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Gender / Age</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.gender} • {selectedPatient.age || '—'} yrs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Blood Group</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.blood_group || 'Not recorded'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.phone || '—'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Insurance</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.insurance_provider || 'Self-pay'}</span>
                  </div>
                </div>

                {detailLoading ? (
                  <p className="text-sm text-slate-500 text-center py-8">Fetching clinical records…</p>
                ) : (
                  <>
                    {/* Appointments History */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>Appointment History ({patientAppointments.length})</span>
                      </div>
                      {patientAppointments.length === 0 ? (
                        <p className="text-xs text-slate-400">No past appointment history.</p>
                      ) : (
                        <div className="space-y-2">
                          {patientAppointments.map((appt) => (
                            <div key={appt.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{appt.appointment_date} ({appt.time_slot_start?.slice(0, 5)})</span>
                                <p className="text-slate-500 mt-0.5">{appt.reason || 'Consultation'}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                {appt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prescriptions History */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <Pill className="w-4 h-4 text-cyan-600" />
                        <span>Prescriptions ({patientPrescriptions.length})</span>
                      </div>
                      {patientPrescriptions.length === 0 ? (
                        <p className="text-xs text-slate-400">No prescriptions recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {patientPrescriptions.map((p) => (
                            <div key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 dark:text-white">Code: {p.prescription_code}</span>
                                <span className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-500">{p.medicines?.map((m) => m.name).join(', ') || 'No medicines listed'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lab Reports */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <FlaskConical className="w-4 h-4 text-emerald-600" />
                        <span>Lab & Diagnostic Reports ({patientLabReports.length})</span>
                      </div>
                      {patientLabReports.length === 0 ? (
                        <p className="text-xs text-slate-400">No lab reports on file.</p>
                      ) : (
                        <div className="space-y-2">
                          {patientLabReports.map((lab) => (
                            <div key={lab.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{lab.test_name} ({lab.report_code})</span>
                                <p className="text-slate-500 mt-0.5">Status: {lab.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
