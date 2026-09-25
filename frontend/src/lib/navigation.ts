import { RoleName, User } from '../types';

export const getDashboardPath = (role?: RoleName | null): string => {
  switch (role) {
    case 'super_admin':
      return '/dashboard/super-admin';
    case 'hospital_admin':
      return '/dashboard/admin';
    case 'receptionist':
      return '/dashboard/reception';
    case 'doctor':
      return '/dashboard/doctor';
    case 'lab_technician':
      return '/dashboard/lab';
    case 'pharmacist':
      return '/dashboard/pharmacy';
    case 'patient':
      return '/dashboard/patient';
    default:
      return '/login';
  }
};

export const getDashboardPathForUser = (user?: User | null): string =>
  getDashboardPath(user?.role.name);
