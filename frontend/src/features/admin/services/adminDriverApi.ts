import api from '@/services/axios';

const adminDriverApi = {
    // GET /api/admin/drivers
    getAllDrivers: async (lifecycleStatus?: string) => {
        const res = await api.get('/admin/drivers', {
            params: lifecycleStatus ? { lifecycleStatus } : undefined
        });
        return res.data;
    },

    // GET /api/admin/drivers/{id}
    getDriverDetail: async (id: number | string) => {
        const res = await api.get(`/admin/drivers/${id}`);
        return res.data;
    },

    // PUT /api/admin/drivers/{id}/approve
    approveDriver: async (id: number | string) => {
        const res = await api.put(`/admin/drivers/${id}/approve`);
        return res.data;
    },

    // PUT /api/admin/drivers/{id}/reject
    rejectDriver: async (id: number | string, reason: string) => {
        const res = await api.put(`/admin/drivers/${id}/reject`, { reason });
        return res.data;
    },

    // Helper to open document image in new tab
    viewDocumentImage: (imageUrl: string) => {
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        }
    }
};

export default adminDriverApi;
