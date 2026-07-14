import api from './axios';

export interface RefundRequestPayload {
  bankName: string;
  accountNo: string;
  accountHolderName: string;
  branchName: string;
  reason?: string;
}

export interface RefundResponseDto {
  id: number;
  bookingId: number;
  packageName: string;
  touristName: string;
  amount: number;
  bankName: string;
  accountNo: string;
  accountHolderName: string;
  branchName: string;
  reason: string;
  status: string;
  refundSlipUrl?: string;
  createdAt: string;
}

const refundService = {
  requestRefund: async (bookingId: number | string, data: RefundRequestPayload) => {
    const response = await api.post(`/tourist/bookings/${bookingId}/refund-request`, data);
    return response.data;
  },

  getTouristRefundRequests: async (): Promise<RefundResponseDto[]> => {
    const response = await api.get('/tourist/refund-requests');
    return response.data;
  },

  getAgentRefundRequests: async (): Promise<RefundResponseDto[]> => {
    const response = await api.get('/v1/agent/refund-requests');
    return response.data;
  },

  approveRefundRequest: async (requestId: number | string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/v1/agent/refund-requests/${requestId}/approve`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  declineRefundRequest: async (requestId: number | string, reason: string) => {
    const response = await api.post(`/v1/agent/refund-requests/${requestId}/decline`, { reason });
    return response.data;
  },
};

export default refundService;
