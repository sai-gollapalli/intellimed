import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  FlaskConical,
  Pill,
  CreditCard,
  Bell,
  Settings,
  Camera,
  LogOut,
  ShieldCheck,
  Building2,
  FolderHeart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleName } from '../../types';
import { Avatar } from '../common/Avatar';

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const roleMenus: Record<RoleName, MenuItem[]> = {
    super_admin: [
      { title: 'Super Overview', path: '/dashboard/super-admin', icon: LayoutDashboard },
      { title: 'Hospital Admins', path: '/dashboard/admins', icon: ShieldCheck },
      { title: 'Departments', path: '/dashboard/departments', icon: Building2 },
      { title: 'Audit Logs', path: '/dashboard/audit-logs', icon: FileText },
      { title: 'System Settings', path: '/dashboard/settings', icon: Settings },
    ],
    hospital_admin: [
      { title: 'Hospital Analytics', path: '/dashboard/admin', icon: LayoutDashboard },
      { title: 'Staff Directory', path: '/dashboard/staff', icon: Users },
      { title: 'Doctors Management', path: '/dashboard/doctors-management', icon: UserCheck },
      { title: 'Department Analytics', path: '/dashboard/departments', icon: Building2 },
      { title: 'Billing & Revenue', path: '/dashboard/billing-analytics', icon: CreditCard },
      { title: 'Audit Logs', path: '/dashboard/audit-logs', icon: FileText },
    ],
    receptionist: [
      { title: 'Reception Desk', path: '/dashboard/reception', icon: LayoutDashboard },
      { title: 'AI Face Search', path: '/dashboard/face-search', icon: Camera },
      { title: 'Register Patient', path: '/dashboard/patient-registration', icon: Users },
      { title: 'Appointments', path: '/dashboard/appointments', icon: Calendar },
      { title: 'Patient Check-In', path: '/dashboard/checkin', icon: UserCheck },
      { title: 'Billing & Invoices', path: '/dashboard/billing', icon: CreditCard },
    ],
    doctor: [
      { title: 'Doctor Console', path: '/dashboard/doctor', icon: LayoutDashboard },
      { title: 'My Patients & Records', path: '/dashboard/doctor-patients', icon: Users },
      { title: 'Today\'s Schedule', path: '/dashboard/doctor-schedule', icon: Calendar },
      { title: 'Patients Timeline', path: '/dashboard/patient-timeline', icon: FolderHeart },
      { title: 'Prescriptions Engine', path: '/dashboard/prescriptions', icon: FileText },
      { title: 'Lab Orders', path: '/dashboard/lab-orders', icon: FlaskConical },
    ],
    lab_technician: [
      { title: 'Lab Workstation', path: '/dashboard/lab', icon: LayoutDashboard },
      { title: 'Pending Test Orders', path: '/dashboard/lab-orders', icon: FlaskConical },
      { title: 'Upload Reports', path: '/dashboard/lab-upload', icon: FileText },
      { title: 'Radiology Scans', path: '/dashboard/radiology', icon: Camera },
    ],
    pharmacist: [
      { title: 'Pharmacy Kiosk', path: '/dashboard/pharmacy', icon: LayoutDashboard },
      { title: 'Dispense Medicines', path: '/dashboard/dispense', icon: Pill },
      { title: 'Medicine Inventory', path: '/dashboard/inventory', icon: Building2 },
      { title: 'Batch Expiry Alerts', path: '/dashboard/expiry-alerts', icon: Bell },
    ],
    patient: [
      { title: 'My Health Portal', path: '/dashboard/patient', icon: LayoutDashboard },
      { title: 'My Appointments', path: '/dashboard/my-appointments', icon: Calendar },
      { title: 'Medical History', path: '/dashboard/my-history', icon: FolderHeart },
      { title: 'Download Reports', path: '/dashboard/my-reports', icon: FileText },
      { title: 'My Prescriptions', path: '/dashboard/my-prescriptions', icon: Pill },
      { title: 'Invoices & Bills', path: '/dashboard/my-billing', icon: CreditCard },
    ],
  };

  const currentMenu = roleMenus[user.role.name] || roleMenus.patient;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <span className="font-extrabold text-white text-lg tracking-tight">Intelli<span className="text-sky-400">Med</span></span>
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {user.role.display_name}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Clinical Navigation
        </div>
        {currentMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar
              name={`${user.first_name} ${user.last_name}`}
              imageUrl={user.avatar_path}
              size="sm"
              className="shrink-0"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
