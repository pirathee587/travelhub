import api from '@/services/axios';

const adminBookingApi = {

    // GET /api/admin/bookings
    getAllBookings: async () => {
        const res = await api.get('/admin/bookings');
        return res.data;
    },

    // GET /api/admin/bookings/{id}
    getBookingById: async (id) => {
        const res = await api.get(
            `/admin/bookings/${id}`);
        return res.data;
    },

    // GET /api/admin/bookings/status?status=pending
    getBookingsByStatus: async (status) => {
        const res = await api.get(
            '/admin/bookings/status', {
            params: { status },
        });
        return res.data;
    },

    // PATCH /api/admin/bookings/{id}/status
    // Body: { status: "confirmed" }
    updateBookingStatus: async (id, status) => {
        const res = await api.patch(
            `/admin/bookings/${id}/status`,
            { status });
        return res.data;
    },
};

export default adminBookingApi;
