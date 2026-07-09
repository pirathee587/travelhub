import api from './axios';

const billingService = {
  getHistory: () => api.get('/payments/my-billing').then(res => res.data),
  downloadReceipt: (bookingId: string | number) => api.get(`/payments/receipt/${bookingId}`, { responseType: 'blob' }),
};

export default billingService;
