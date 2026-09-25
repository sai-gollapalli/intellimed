import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Building2, Users, Calendar, CreditCard, Activity, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { appointmentsApi, billingApi } from '../../lib/api';
import type { Appointment, Billing } from '../../types';

export const HospitalAdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [appointmentsResponse, billingResponse] = await Promise.all([
          appointmentsApi.list(),
          billingApi.list(),
        ]);
        setAppointments(appointmentsResponse.data.results ?? []);
        setBilling(Array.isArray(billingResponse.data) ? billingResponse.data : []);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const checkedInCount = appointments.filter((appointment) => appointment.status === 'checked_in' || appointment.status === 'in_progress').length;
  const pendingBilling = billing.filter((bill) => bill.status !== 'paid').length;

  return (
    <DashboardLayout title="Hospital Operations Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500">
            <p className="text-xs text-slate-500 font-medium">Today's Total Visits</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{loading ? '—' : appointments.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">{checkedInCount} Checked In</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-indigo-500">
            <p className="text-xs text-slate-500 font-medium">Pending Billing</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{loading ? '—' : pendingBilling}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">Invoices awaiting settlement</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500 font-medium">Appointments Today</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{loading ? '—' : appointments.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Live queue data from backend</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-purple-500">
            <p className="text-xs text-slate-500 font-medium">Billing Amount Outstanding</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹ {loading ? '—' : billing.reduce((sum, bill) => sum + (bill.status === 'paid' ? 0 : bill.amount_payable), 0).toFixed(2)}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Updated from invoice records</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Department Workload</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Cardiology</span>
                  <span>85% Capacity</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Neurology</span>
                  <span>60% Capacity</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Orthopedics</span>
                  <span>40% Capacity</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 col-span-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Queue Snapshot</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <tr>
                    <th className="p-2.5">Patient</th>
                    <th className="p-2.5">Doctor</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointments.slice(0, 4).map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="p-2.5 font-semibold">{`${appointment.patient?.first_name ?? ''} ${appointment.patient?.last_name ?? ''}`.trim() || 'Unnamed patient'}</td>
                      <td className="p-2.5">Doctor {appointment.doctor_id}</td>
                      <td className="p-2.5"><span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">{appointment.status}</span></td>
                      <td className="p-2.5">{appointment.time_slot_start?.slice(0, 5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
