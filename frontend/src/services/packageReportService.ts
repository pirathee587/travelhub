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
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post('/tourist/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
