import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { departmentsApi, staffApi } from '../../lib/api';
import type { Department, User } from '../../types';

const StatusMessage: React.FC<{ loading: boolean; error: string | null; empty: boolean; emptyText: string }> = ({
  loading,
  error,
  empty,
  emptyText,
}) => {
  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>;
  if (empty) return <p className="text-sm text-slate-500">{emptyText}</p>;
  return null;
};

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    departmentsApi
      .list()
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Unable to load departments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Departments">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Hospital Departments</h3>
        <StatusMessage loading={loading} error={error} empty={!loading && !error && departments.length === 0} emptyText="No departments configured yet." />
        {!loading && !error && departments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <h4 className="font-bold text-slate-900 dark:text-white">{dept.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{dept.description ?? 'No description'}</p>
                <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded ${dept.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const AuditLogsPage: React.FC = () => (
  <DashboardLayout title="Audit Logs">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">System Audit Trails</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-3 font-medium">Dr. Sarah Jenkins</td>
              <td className="p-3 text-emerald-600 font-semibold">create_prescription</td>
              <td className="p-3 text-slate-500">RX-000042</td>
              <td className="p-3 text-slate-400">2 mins ago</td>
            </tr>
            <tr>
              <td className="p-3 font-medium">Priya Sharma</td>
              <td className="p-3 text-blue-600 font-semibold">face_identify_match</td>
              <td className="p-3 text-slate-500">IM-000104</td>
              <td className="p-3 text-slate-400">14 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export const HospitalAdminsPage: React.FC = () => (
  <DashboardLayout title="Hospital Admins">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">Hospital Administrator Accounts</h3>
      <p className="text-sm text-slate-500">Manage hospital-level admin users and their access permissions.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-3 font-semibold">Admin User</td>
              <td className="p-3">admin@intellimed.local</td>
              <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export const SystemSettingsPage: React.FC = () => (
  <DashboardLayout title="System Settings">
    <div className="glass-card p-6 rounded-2xl space-y-4 max-w-2xl">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">Platform Configuration</h3>
      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Hospital Name</label>
          <input type="text" defaultValue="IntelliMed Smart Hospital" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default GST Rate (%)</label>
          <input type="number" defaultValue={18} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Face Match Threshold</label>
          <input type="number" defaultValue={0.85} step={0.01} className="input-field" />
        </div>
        <button type="button" className="btn-primary">Save Settings</button>
      </div>
    </div>
  </DashboardLayout>
);

export const StaffDirectoryPage: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    staffApi.list()
      .then((res) => setStaff(res.data))
      .catch(() => setError('Unable to load staff directory.'))
      .finally(() => setLoading(false));
  }, []);

  const getRoleDisplayName = (roleName: string) => {
    const names: Record<string, string> = {
      'super_admin': 'Super Admin',
      'hospital_admin': 'Hospital Admin',
      'doctor': 'Doctor',
      'receptionist': 'Receptionist',
      'lab_technician': 'Lab Technician',
      'pharmacist': 'Pharmacist',
    };
    return names[roleName] || roleName;
  };

  return (
    <DashboardLayout title="Staff Directory">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Medical & Administrative Staff</h3>
        <StatusMessage loading={loading} error={error} empty={!loading && !error && staff.length === 0} emptyText="No staff members found." />
        {!loading && !error && staff.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="p-3 font-semibold">{member.full_name}</td>
                    <td className="p-3">{getRoleDisplayName(member.role.name)}</td>
                    <td className="p-3">{member.role.name === 'doctor' ? member.doctor_profile?.department?.name || '—' : '—'}</td>
                    <td className="p-3"><span className={member.is_active ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>{member.is_active ? 'On Duty' : 'Off Duty'}</span></td>
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

export const DoctorsManagementPage: React.FC = () => (
  <DashboardLayout title="Doctors Management">
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white text-base">Doctor Roster</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
            <tr>
              <th className="p-3">Doctor</th>
              <th className="p-3">Specialization</th>
              <th className="p-3">Department</th>
              <th className="p-3">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-3 font-semibold">Dr. Sarah Jenkins</td>
              <td className="p-3">Cardiologist</td>
              <td className="p-3">Cardiology</td>
              <td className="p-3"><span className="text-emerald-600 font-semibold">Available</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export const BillingAnalyticsPage: React.FC = () => (
  <DashboardLayout title="Billing & Revenue Analytics">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="glass-card p-5 rounded-xl border-l-4 border-emerald-500">
        <p className="text-xs text-slate-500 font-medium">Monthly Revenue</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹ 13,50,000</p>
      </div>
      <div className="glass-card p-5 rounded-xl border-l-4 border-amber-500">
        <p className="text-xs text-slate-500 font-medium">Outstanding Invoices</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">24</p>
      </div>
      <div className="glass-card p-5 rounded-xl border-l-4 border-sky-500">
        <p className="text-xs text-slate-500 font-medium">Insurance Claims</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹ 2,40,000</p>
      </div>
    </div>
  </DashboardLayout>
);
