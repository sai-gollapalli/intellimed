import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleName } from './types';

// Landing & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { StaffRegisterPage } from './pages/StaffRegisterPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyOTPPage } from './pages/VerifyOTPPage';
import { FaceEnrollmentPage } from './pages/FaceEnrollmentPage';
import { FaceLoginPage } from './pages/FaceLoginPage';

// Role Dashboards
import { SuperAdminDashboard } from './pages/dashboards/SuperAdminDashboard';
import { HospitalAdminDashboard } from './pages/dashboards/HospitalAdminDashboard';
import { ReceptionDashboard } from './pages/dashboards/ReceptionDashboard';
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard';
import { LabDashboard } from './pages/dashboards/LabDashboard';
import { PharmacyDashboard } from './pages/dashboards/PharmacyDashboard';
import { PatientPortal } from './pages/dashboards/PatientPortal';

// Dashboard Sub-Pages
import {
  HospitalAdminsPage,
  DepartmentsPage,
  AuditLogsPage,
  SystemSettingsPage,
  StaffDirectoryPage,
  DoctorsManagementPage,
  BillingAnalyticsPage,
} from './pages/subpages/AdminSubPages';
import { HospitalStaffPage } from './pages/subpages/HospitalStaffPage';
import {
  FaceSearchPage,
  PatientRegistrationPage,
  AppointmentsPage,
  CheckInPage,
  BillingPage,
} from './pages/subpages/ReceptionSubPages';
import {
  DoctorSchedulePage,
  PatientTimelinePage,
  PrescriptionsPage,
  LabOrdersPage,
  LabUploadPage,
  RadiologyPage,
  DispensePage,
  InventoryPage,
  ExpiryAlertsPage,
} from './pages/subpages/ClinicalSubPages';
import { DoctorPatientsPage } from './pages/subpages/DoctorPatientsPage';
import {
  MyAppointmentsPage,
  MyHistoryPage,
  MyReportsPage,
  MyPrescriptionsPage,
  MyBillingPage,
} from './pages/subpages/PatientSubPages';

type DashboardRoute = {
  path: string;
  element: React.ReactNode;
  roles: RoleName[];
};

const dashboardRoutes: DashboardRoute[] = [
  // Super Admin
  { path: '/dashboard/super-admin', element: <SuperAdminDashboard />, roles: ['super_admin'] },
  { path: '/dashboard/admins', element: <HospitalAdminsPage />, roles: ['super_admin'] },
  { path: '/dashboard/settings', element: <SystemSettingsPage />, roles: ['super_admin'] },

  // Super Admin + Hospital Admin
  { path: '/dashboard/admin', element: <HospitalAdminDashboard />, roles: ['super_admin', 'hospital_admin'] },
  { path: '/dashboard/departments', element: <DepartmentsPage />, roles: ['super_admin', 'hospital_admin'] },
  { path: '/dashboard/audit-logs', element: <AuditLogsPage />, roles: ['super_admin', 'hospital_admin'] },
  { path: '/dashboard/staff', element: <StaffDirectoryPage />, roles: ['super_admin', 'hospital_admin'] },
  { path: '/dashboard/doctors-management', element: <DoctorsManagementPage />, roles: ['super_admin', 'hospital_admin'] },
  { path: '/dashboard/billing-analytics', element: <BillingAnalyticsPage />, roles: ['super_admin', 'hospital_admin'] },

  // Reception
  { path: '/dashboard/reception', element: <ReceptionDashboard />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },
  { path: '/dashboard/patient-registration', element: <PatientRegistrationPage />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },
  { path: '/dashboard/face-search', element: <FaceSearchPage />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },
  { path: '/dashboard/appointments', element: <AppointmentsPage />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },
  { path: '/dashboard/checkin', element: <CheckInPage />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },
  { path: '/dashboard/billing', element: <BillingPage />, roles: ['super_admin', 'hospital_admin', 'receptionist'] },

  // Doctor
  { path: '/dashboard/doctor', element: <DoctorDashboard />, roles: ['super_admin', 'hospital_admin', 'doctor'] },
  { path: '/dashboard/doctor-patients', element: <DoctorPatientsPage />, roles: ['super_admin', 'hospital_admin', 'doctor'] },
  { path: '/dashboard/doctor-schedule', element: <DoctorSchedulePage />, roles: ['super_admin', 'hospital_admin', 'doctor'] },
  { path: '/dashboard/patient-timeline', element: <PatientTimelinePage />, roles: ['super_admin', 'hospital_admin', 'doctor'] },
  { path: '/dashboard/prescriptions', element: <PrescriptionsPage />, roles: ['super_admin', 'hospital_admin', 'doctor'] },

  // Lab
  { path: '/dashboard/lab', element: <LabDashboard />, roles: ['super_admin', 'hospital_admin', 'lab_technician'] },
  { path: '/dashboard/lab-upload', element: <LabUploadPage />, roles: ['super_admin', 'hospital_admin', 'lab_technician'] },
  { path: '/dashboard/radiology', element: <RadiologyPage />, roles: ['super_admin', 'hospital_admin', 'lab_technician'] },

  // Lab orders (doctor + lab tech)
  { path: '/dashboard/lab-orders', element: <LabOrdersPage />, roles: ['super_admin', 'hospital_admin', 'doctor', 'lab_technician'] },

  // Pharmacy
  { path: '/dashboard/pharmacy', element: <PharmacyDashboard />, roles: ['super_admin', 'hospital_admin', 'pharmacist'] },
  { path: '/dashboard/dispense', element: <DispensePage />, roles: ['super_admin', 'hospital_admin', 'pharmacist'] },
  { path: '/dashboard/inventory', element: <InventoryPage />, roles: ['super_admin', 'hospital_admin', 'pharmacist'] },
  { path: '/dashboard/expiry-alerts', element: <ExpiryAlertsPage />, roles: ['super_admin', 'hospital_admin', 'pharmacist'] },

  // Patient portal
  { path: '/dashboard/patient', element: <PatientPortal />, roles: ['patient', 'super_admin'] },
  { path: '/dashboard/my-appointments', element: <MyAppointmentsPage />, roles: ['patient', 'super_admin'] },
  { path: '/dashboard/my-history', element: <MyHistoryPage />, roles: ['patient', 'super_admin'] },
  { path: '/dashboard/my-reports', element: <MyReportsPage />, roles: ['patient', 'super_admin'] },
  { path: '/dashboard/my-prescriptions', element: <MyPrescriptionsPage />, roles: ['patient', 'super_admin'] },
  { path: '/dashboard/my-billing', element: <MyBillingPage />, roles: ['patient', 'super_admin'] },
];

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/staff-login" element={<StaffLoginPage />} />
          <Route path="/staff-register" element={<StaffRegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/face-login" element={<FaceLoginPage />} />

          {/* Face enrollment requires authentication */}
          <Route element={<ProtectedRoute allowedRoles={['patient', 'super_admin']} />}>
            <Route path="/face-enroll" element={<FaceEnrollmentPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          {dashboardRoutes.map(({ path, element, roles }) => (
            <Route key={path} element={<ProtectedRoute allowedRoles={roles} />}>
              <Route path={path} element={element} />
            </Route>
          ))}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
