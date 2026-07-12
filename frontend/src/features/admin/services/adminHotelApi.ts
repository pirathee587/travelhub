import api from '@/services/axios';

const adminHotelApi = {

    // GET /api/admin/hotels
    getAllHotels: async () => {
        const res = await api.get('/admin/hotels');
        return res.data;
    },

    // GET /api/admin/hotels/status?status=Pending
    getHotelsByStatus: async (status) => {
        const res = await api.get(
            '/admin/hotels/status', {
            params: { status },
        });
        return res.data;
    },

    // GET /api/admin/hotels/{id}
    // View Button → Full detail
    getHotelDetail: async (id) => {
        const res = await api.get(`/admin/hotels/${id}`);
        return res.data;
    },

    // PATCH /api/admin/hotels/{id}/approve
    approveHotel: async (id) => {
        const res = await api.patch(
            `/admin/hotels/${id}/approve`);
        return res.data;
    },

    // PATCH /api/admin/hotels/{id}/reject
    rejectHotel: async (id, reason) => {
        const res = await api.patch(
            `/admin/hotels/${id}/reject`,
            { reason });
        return res.data;
    },

    // DELETE /api/admin/hotels/{id}
    deleteHotel: async (id) => {
        const res = await api.delete(
            `/admin/hotels/${id}`);
        return res.data;
    },

    // PATCH /api/admin/hotels/{id}/toggle-active
    toggleHotelActive: async (id) => {
        const res = await api.patch(
            `/admin/hotels/${id}/toggle-active`);
        return res.data;
    },

    // View NIC Photocopy
    viewNicPhotocopy: (nicImageUrl) => {
        window.open(nicImageUrl, '_blank');
    },
};

export default adminHotelApi;
