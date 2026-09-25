import api from './axios';
import { Patient, Appointment, Prescription, LabReport, Billing, Department, User } from '../types';

export const patientsApi = {
  search: (query?: string, page = 1, pageSize = 20) =>
    api.get<{ total: number; page: number; page_size: number; results: Patient[] }>('/patients', {
      params: { q: query, page, page_size: pageSize },
    }),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  getByCode: (code: string) => api.get<Patient>(`/patients/code/${code}`),
  myProfile: () => api.get<Patient>('/patients/my-profile'),
  register: (data: Partial<Patient>) => api.post<Patient>('/patients', data),
  update: (id: number, data: Partial<Patient>) => api.put<Patient>(`/patients/${id}`, data),
};

export const appointmentsApi = {
  list: (params?: { patient_id?: number; doctor_id?: number; appointment_date?: string; status?: string }) =>
    api.get<{ total: number; page: number; page_size: number; results: Appointment[] }>('/appointments', { params }),
  today: (doctorId?: number) =>
    api.get<{ total: number; page: number; page_size: number; results: Appointment[] }>('/appointments/today', {
      params: { doctor_id: doctorId },
    }),
  book: (data: any) => api.post<Appointment>('/appointments', data),
  checkIn: (id: number) => api.patch<Appointment>(`/appointments/${id}/check-in`),
  complete: (id: number) => api.patch<Appointment>(`/appointments/${id}/complete`),
  cancel: (id: number, reason: string) => api.patch<Appointment>(`/appointments/${id}/cancel`, null, { params: { reason } }),
};

export const prescriptionsApi = {
  list: (params?: { patient_id?: number; doctor_id?: number; is_dispensed?: string }) =>
    api.get<Prescription[]>('/prescriptions', { params }),
  getById: (id: number) => api.get<Prescription>(`/prescriptions/${id}`),
  create: (data: any) => api.post<Prescription>('/prescriptions', data),
  dispense: (id: number, status: 'partial' | 'dispensed', notes?: string) =>
    api.patch<Prescription>(`/prescriptions/${id}/dispense`, { prescription_id: id, status, notes }),
};

export const labReportsApi = {
  list: (params?: { patient_id?: number; status?: string }) =>
    api.get<LabReport[]>('/lab-reports', { params }),
  getById: (id: number) => api.get<LabReport>(`/lab-reports/${id}`),
  create: (data: any) => api.post<LabReport>('/lab-reports', data),
};

export const billingApi = {
  list: (params?: { patient_id?: number; status?: string }) =>
    api.get<Billing[]>('/billing', { params }),
  getById: (id: number) => api.get<Billing>(`/billing/${id}`),
  create: (data: any) => api.post<Billing>('/billing', data),
  recordPayment: (id: number, data: { amount: number; payment_method: string; transaction_id?: string }) =>
    api.post(`/billing/${id}/payment`, { billing_id: id, ...data }),
};

export const departmentsApi = {
  list: () => api.get<Department[]>('/departments'),
};

export const staffApi = {
  list: (params?: { role?: string; department_id?: number; is_active?: boolean }) =>
    api.get<User[]>('/users/staff', { params }),
  getById: (id: number) => api.get<User>(`/users/staff/${id}`),
  create: (data: any) => api.post<User>('/users/staff', data),
  update: (id: number, data: any) => api.patch<User>(`/users/staff/${id}`, data),
  delete: (id: number) => api.delete(`/users/staff/${id}`),
};

export const documentsApi = {
  list: (params?: { patient_id?: number; document_type?: string }) =>
    api.get<any[]>('/documents', { params }),
  getById: (id: number) => api.get<any>(`/documents/${id}`),
  upload: (patientId: number, documentType: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (description) formData.append('description', description);
    return api.post<any>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/documents/${id}`),
};

export const radiologyApi = {
  list: (params?: { patient_id?: number; doctor_id?: number; status?: string; report_type?: string }) =>
    api.get<any[]>('/radiology', { params }),
  getById: (id: number) => api.get<any>(`/radiology/${id}`),
  create: (data: any) => api.post<any>('/radiology', data),
  update: (id: number, data: any) => api.put<any>(`/radiology/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/radiology/${id}/status`, null, { params: { status } }),
  uploadImages: (id: number, images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));
    return api.post<any>(`/radiology/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: number) => api.delete(`/radiology/${id}`),
};

export const notificationsApi = {
  list: (params?: { is_read?: boolean; notification_type?: string }) =>
    api.get<any[]>('/notifications', { params }),
  getUnreadCount: () => api.get<{ unread_count: number }>('/notifications/unread-count'),
  markAsRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};
