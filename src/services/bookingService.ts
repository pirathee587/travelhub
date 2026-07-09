import api from './axios';

const bookingService = {
  getBookingDetails: async (id: string | number) => {
    const response = await api.get(`/tourist/bookings/${id}`);
    return response.data;
  }
};

export default bookingService;
