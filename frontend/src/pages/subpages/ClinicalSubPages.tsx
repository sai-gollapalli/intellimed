import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { appointmentsApi, prescriptionsApi, labReportsApi } from '../../lib/api';
import type { Appointment, Prescription, LabReport } from '../../types';

const formatTime = (value?: string) => (value ? value.slice(0, 5) : '—');

const formatStatus = (status?: string) => {
  const normalized = status ?? 'scheduled';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const DoctorSchedulePage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi
      .today()
      .then((res) => setAppointments(res.data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Today's Schedule">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading schedule…</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{`${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim()}</p>
                  <p className="text-xs text-slate-500">{appointment.reason ?? 'Consultation'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sky-600">{formatTime(appointment.time_slot_start)}</p>
                  <p className="text-[10px] text-slate-400">{formatStatus(appointment.status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const PatientTimelinePage: React.FC = () => (
  <DashboardLayout title="Patients Timeline">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Recent Patient Activity</h3>
      <div className="space-y-4 border-l-2 border-sky-200 pl-4">
        <div>
          <p className="text-xs text-slate-400">Today, 09:30 AM</p>
          <p className="font-semibold text-sm">Alexander Wright — Checked In</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Today, 10:15 AM</p>
          <p className="font-semibold text-sm">Alexander Wright — Prescription RX-000042 Created</p>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

export const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionsApi
      .list()
      .then((res) => setPrescriptions(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Prescriptions Engine">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading prescriptions…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Medicines</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {prescriptions.map((rx) => (
                  <tr key={rx.id}>
                    <td className="p-3 font-mono font-bold text-sky-600">{rx.prescription_code}</td>
                    <td className="p-3">{rx.patient_id}</td>
                    <td className="p-3">{rx.medicines?.length ?? 0} item(s)</td>
                    <td className="p-3">{rx.is_dispensed}</td>
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

export const LabOrdersPage: React.FC = () => {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    labReportsApi
      .list({ status: 'pending' })
      .then((res) => setReports(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Lab Orders">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading lab orders…</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-500">No pending lab orders.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-sm">{report.test_name}</p>
                <p className="text-xs text-slate-500">{report.report_code} · Patient {report.patient_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const LabUploadPage: React.FC = () => (
  <DashboardLayout title="Upload Lab Reports">
    <div className="glass-card p-6 rounded-2xl space-y-4 max-w-2xl">
      <h3 className="font-bold text-slate-900 dark:text-white">Upload Report Document</h3>
      <input type="text" placeholder="Patient Code (IM-000104)" className="input-field" />
      <select className="input-field">
        <option>Complete Blood Count (CBC)</option>
        <option>Lipid Profile</option>
      </select>
      <textarea rows={4} placeholder="Result parameters…" className="input-field" />
      <button type="button" className="btn-primary w-full">Upload & Notify Patient</button>
    </div>
  </DashboardLayout>
);

export const RadiologyPage: React.FC = () => (
  <DashboardLayout title="Radiology Scans">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Pending Radiology Orders</h3>
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="font-bold text-sm">Chest X-Ray — IM-000104</p>
        <p className="text-xs text-slate-500">Ordered by Dr. Sarah Jenkins</p>
        <button type="button" className="btn-primary mt-2 py-1 px-3 text-[11px]">Process Scan</button>
      </div>
    </div>
  </DashboardLayout>
);

export const DispensePage: React.FC = () => (
  <DashboardLayout title="Dispense Medicines">
    <div className="glass-card p-6 rounded-2xl">
      <p className="text-sm text-slate-500 mb-4">Select a pending prescription from the queue to dispense medicines.</p>
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="font-bold">RX-000042 — Alexander Wright</p>
        <button type="button" className="btn-primary mt-3 w-full">Confirm Dispense</button>
      </div>
    </div>
  </DashboardLayout>
);

export const InventoryPage: React.FC = () => (
  <DashboardLayout title="Medicine Inventory">
    <div className="glass-card p-6 rounded-2xl overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
          <tr>
            <th className="p-3">Medicine</th>
            <th className="p-3">Batch</th>
            <th className="p-3">Stock</th>
            <th className="p-3">Expiry</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          <tr>
            <td className="p-3 font-semibold">Atorvastatin 10mg</td>
            <td className="p-3 font-mono">BAT-9940</td>
            <td className="p-3">240 units</td>
            <td className="p-3">2027-06-01</td>
          </tr>
          <tr>
            <td className="p-3 font-semibold">Paracetamol 500mg</td>
            <td className="p-3 font-mono">B-201</td>
            <td className="p-3">40 units</td>
            <td className="p-3 text-red-600">2026-08-12</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
);

export const ExpiryAlertsPage: React.FC = () => (
  <DashboardLayout title="Batch Expiry Alerts">
    <div className="space-y-3">
      <div className="glass-card p-4 rounded-xl border-l-4 border-red-500">
        <p className="font-bold text-red-700">Paracetamol 500mg (Batch B-201)</p>
        <p className="text-xs text-slate-500 mt-1">Expires in 12 days · 40 tablets remaining</p>
      </div>
    </div>
  </DashboardLayout>
);
