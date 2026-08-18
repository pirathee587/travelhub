import api from './axios';

export interface PackageReportRequestPayload {
  category: string;
  title: string;
  description: string;
}

export interface AdminReportStatusUpdatePayload {
  status: string;
  adminNotes?: string;
  resolution?: string;
}

export interface PackageReportResponseDto {
  id: number;
  bookingId: number;
  bookingStatus: string;
  userId: number;
  userName: string;
  userEmail: string;
  packageId: number;
  packageName: string;
  packageLocation: string;
  agentId: number;
  agentName: string;
  agentEmail: string;
  category: string;
  title: string;
  description: string;
  evidenceUrls: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const packageReportService = {
  createReport: async (bookingId: number | string, data: PackageReportRequestPayload, files?: File[]): Promise<PackageReportResponseDto> => {
    const formData = new FormData();
    formData.append('bookingId', String(bookingId));
    formData.append('data', JSON.stringify(data));
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${BASE_URL}/tourist/reports?bookingId=${bookingId}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData?.message || `Failed with status ${response.status}`);
    }
    return resData;
  },

  getTouristReports: async (): Promise<PackageReportResponseDto[]> => {
    const response = await api.get('/tourist/reports');
    return response.data;
  },

  getTouristReportById: async (id: number | string): Promise<PackageReportResponseDto> => {
    const response = await api.get(`/tourist/reports/${id}`);
    return response.data;
  },

  getAdminReports: async (): Promise<PackageReportResponseDto[]> => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  getAdminReportById: async (id: number | string): Promise<PackageReportResponseDto> => {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  updateAdminReportStatus: async (id: number | string, data: AdminReportStatusUpdatePayload): Promise<PackageReportResponseDto> => {
    const response = await api.patch(`/admin/reports/${id}/status`, data);
    return response.data;
  },
};

export default packageReportService;
