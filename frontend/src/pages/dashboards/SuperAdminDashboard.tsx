import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Shield, Building, Users, Activity, FileText, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const patientGrowthData = [
  { month: 'Jan', patients: 120, revenue: 45000 },
  { month: 'Feb', patients: 180, revenue: 52000 },
  { month: 'Mar', patients: 240, revenue: 68000 },
  { month: 'Apr', patients: 310, revenue: 84000 },
  { month: 'May', patients: 450, revenue: 110000 },
  { month: 'Jun', patients: 520, revenue: 135000 },
];

export const SuperAdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Super Admin Control Center">
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Registered Patients</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,248</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +14% this month
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-indigo-500 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Medical Staff</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">84</p>
              <span className="text-[10px] text-slate-400 mt-1 block">24 Doctors, 12 Labs</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Biometric Identifications</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">3,420</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">99.8% Match Rate</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border-l-4 border-amber-500 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Monthly Revenue</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹ 13,50,000</p>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">GST 18% Compliant</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Growth Area Chart */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Patient Growth & Adoption</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="patients" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital Revenue Stream (INR)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Logs Table */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent System Audit Trails</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-medium text-slate-900 dark:text-white">Dr. Sarah Jenkins</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">doctor</span></td>
                  <td className="p-3 font-semibold text-emerald-600">create_prescription</td>
                  <td className="p-3 text-slate-500">RX-000042</td>
                  <td className="p-3 font-mono text-slate-400">192.168.1.104</td>
                  <td className="p-3 text-slate-400">2 mins ago</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-medium text-slate-900 dark:text-white">Priya Sharma</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">receptionist</span></td>
                  <td className="p-3 font-semibold text-blue-600">face_identify_match</td>
                  <td className="p-3 text-slate-500">IM-000104</td>
                  <td className="p-3 font-mono text-slate-400">192.168.1.112</td>
                  <td className="p-3 text-slate-400">14 mins ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
