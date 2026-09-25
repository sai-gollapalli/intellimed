import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserPlus, Edit, Trash2, Search, Filter, MoreVertical } from 'lucide-react';
import { staffApi, departmentsApi } from '../../lib/api';
import type { User, Department } from '../../types';

export const HospitalStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [staffResponse, deptResponse] = await Promise.all([
          staffApi.list(),
          departmentsApi.list(),
        ]);
        setStaff(staffResponse.data);
        setDepartments(deptResponse.data);
      } catch {
        setError('Unable to load staff data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || member.role.name === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-purple-100 text-purple-700',
      'hospital_admin': 'bg-blue-100 text-blue-700',
      'doctor': 'bg-emerald-100 text-emerald-700',
      'receptionist': 'bg-amber-100 text-amber-700',
      'lab_technician': 'bg-cyan-100 text-cyan-700',
      'pharmacist': 'bg-pink-100 text-pink-700',
    };
    return colors[roleName] || 'bg-slate-100 text-slate-700';
  };

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
    <DashboardLayout title="Hospital Staff Management">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="receptionist">Receptionists</option>
              <option value="lab_technician">Lab Technicians</option>
              <option value="pharmacist">Pharmacists</option>
              <option value="hospital_admin">Hospital Admins</option>
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>

        {/* Staff Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Staff Member</th>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Role</th>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Department</th>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading staff data...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-red-500">{error}</td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No staff members found.</td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{member.full_name}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role.name)}`}>
                          {getRoleDisplayName(member.role.name)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                        {member.role.name === 'doctor' ? member.doctor_profile?.department?.name || '—' : '—'}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                        {member.phone || '—'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${member.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{staff.length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Doctors</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{staff.filter(s => s.role.name === 'doctor').length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Active Staff</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{staff.filter(s => s.is_active).length}</p>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 font-medium">Departments</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{departments.length}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
