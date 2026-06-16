import api from './api';

const bookingService = {
  getBookingDetails: async (id) => {
    const response = await api.get(`/tourist/bookings/${id}`);
    return response.data;
  }
};

export default bookingService;
