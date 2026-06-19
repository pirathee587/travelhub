import api from './api';

const billingService = {
  getHistory: () => api.get('/payments/my-billing').then(res => res.data),
  downloadReceipt: (bookingId) => api.get(`/payments/receipt/${bookingId}`, { responseType: 'blob' }),
};

export default billingService;
