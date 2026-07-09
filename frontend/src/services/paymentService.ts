import api from './axios';

const paymentService = {
  getCheckoutData: async (bookingId: string | number) => {
    const response = await api.get(`/payments/checkout/${bookingId}`);
    return response.data;
  },

  verifyPayment: async (params: any) => {
    const response = await api.post('/payments/notify', params);
    return response.data;
  }
};

export default paymentService;
