import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Pill, AlertTriangle, Search, CheckCircle2, Package, Clock, ShieldAlert } from 'lucide-react';

export const PharmacyDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Pharmacy & Dispensary Console">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
            <p className="text-xs text-slate-500 font-medium">Prescriptions Dispensed</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">36</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Today's Total</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-red-500">
            <p className="text-xs text-slate-500 font-medium">Batch Expiry Warnings</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">4</p>
            <span className="text-[10px] text-red-600 font-semibold mt-1 block">Expiring within 30 days</span>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500">
            <p className="text-xs text-slate-500 font-medium">Total Medicine Stock</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,840 Units</p>
            <span className="text-[10px] text-sky-600 font-semibold mt-1 block">120 Unique Medicines</span>
          </div>
        </div>

        {/* Prescription Dispense Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4 col-span-2">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">Prescription Dispense Kiosk</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prescription RX-000042</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full">
                Patient: IM-000104 (Alexander Wright)
              </span>
            </div>

            {/* Allergy Alert Banner */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">MEDICINE ALLERGY ALERT:</span> Patient is allergic to <span className="font-bold underline">Penicillin</span>. Do not issue Amoxicillin or Penicillin derivatives!
              </div>
            </div>

            {/* Prescribed Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                  <tr>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage / Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Stock Batch</th>
                    <th className="p-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Atorvastatin 10mg</td>
                    <td className="p-3">1 tablet / night</td>
                    <td className="p-3">30 Days</td>
                    <td className="p-3 font-mono text-emerald-600">BAT-9940 (Exp 2027)</td>
                    <td className="p-3 font-semibold">₹ 150.00</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">Telmisartan 40mg</td>
                    <td className="p-3">1 tablet / morning</td>
                    <td className="p-3">30 Days</td>
                    <td className="p-3 font-mono text-emerald-600">BAT-8812 (Exp 2026)</td>
                    <td className="p-3 font-semibold">₹ 210.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button className="w-full btn-primary py-3">
              <Pill className="w-4 h-4" />
              Confirm & Dispense Medicines (Generate Receipt)
            </button>
          </div>

          {/* Low Stock & Expiry Alerts Sidebar */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Batch Expiry Warnings</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="font-bold text-red-700 dark:text-red-300">Paracetamol 500mg (Batch B-201)</p>
                <p className="text-slate-500 mt-0.5">Expires in 12 days (2026-08-12)</p>
                <span className="text-[10px] font-bold text-red-600 block mt-1">Quantity: 40 tablets left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
