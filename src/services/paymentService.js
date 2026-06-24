import api from './api';

const paymentService = {
  getCheckoutData: async (bookingId) => {
    const response = await api.get(`/payments/checkout/${bookingId}`);
    return response.data;
  },

  verifyPayment: async (params) => {
    const response = await api.post('/payments/notify', params);
    return response.data;
  }
};

export default paymentService;
