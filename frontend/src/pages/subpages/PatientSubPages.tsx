import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Download } from 'lucide-react';
import { appointmentsApi, prescriptionsApi, labReportsApi, billingApi } from '../../lib/api';
import type { Appointment, Prescription, LabReport, Billing } from '../../types';
import { formatDate } from '../../lib/utils';

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentsApi
      .list()
      .then((res) => setAppointments(res.data.results ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Appointments">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading appointments…</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments scheduled.</p>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between">
              <div>
                <p className="font-bold text-sm">{formatDate(appointment.appointment_date)}</p>
                <p className="text-xs text-slate-500">Doctor {appointment.doctor_id} · {appointment.time_slot_start?.slice(0, 5)}</p>
              </div>
              <span className="text-xs font-semibold text-sky-600">{appointment.status}</span>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export const MyHistoryPage: React.FC = () => (
  <DashboardLayout title="Medical History">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white">Health Summary</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Your medical history, diagnoses, and past consultations are stored securely and accessible to authorized clinical staff during your visits.
      </p>
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm">
        <p className="font-semibold">Last Visit</p>
        <p className="text-slate-500 text-xs mt-1">Routine consultation — Essential Hypertension (ICD-10 I10)</p>
      </div>
    </div>
  </DashboardLayout>
);

export const MyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    labReportsApi
      .list()
      .then((res) => setReports(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Download Reports">
      <div className="glass-card p-6 rounded-2xl space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-500">No lab reports available.</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm">{report.test_name}</p>
                <p className="text-xs text-slate-500">{report.report_code} · {formatDate(report.created_at)}</p>
              </div>
              <button type="button" className="btn-outline text-xs"><Download className="w-4 h-4" /> View</button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export const MyPrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionsApi
      .list()
      .then((res) => setPrescriptions(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Prescriptions">
      <div className="glass-card p-6 rounded-2xl space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading prescriptions…</p>
        ) : prescriptions.length === 0 ? (
          <p className="text-sm text-slate-500">No prescriptions on file.</p>
        ) : (
          prescriptions.map((rx) => (
            <div key={rx.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-sm">{rx.prescription_code}</p>
              <p className="text-xs text-slate-500 mt-1">{rx.medicines?.length ?? 0} medicine(s) · Status: {rx.is_dispensed}</p>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export const MyBillingPage: React.FC = () => {
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingApi
      .list()
      .then((res) => setBilling(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Invoices & Bills">
      <div className="glass-card p-6 rounded-2xl space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading invoices…</p>
        ) : billing.length === 0 ? (
          <p className="text-sm text-slate-500">No invoices yet.</p>
        ) : (
          billing.map((bill) => (
            <div key={bill.id} className="flex justify-between items-center p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <p className="font-bold text-sm">Invoice {bill.invoice_no}</p>
                <p className="text-xs text-slate-500">₹ {bill.amount_payable.toFixed(2)} · {bill.status}</p>
              </div>
              <button type="button" className="btn-outline text-xs"><Download className="w-4 h-4" /> View</button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};
