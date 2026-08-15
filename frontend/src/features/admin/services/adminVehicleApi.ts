import api from '@/services/axios';

const adminVehicleApi = {
    // GET /api/admin/vehicles
    getAllVehicles: async (lifecycleStatus?: string) => {
        const res = await api.get('/admin/vehicles', {
            params: lifecycleStatus ? { lifecycleStatus } : undefined
        });
        return res.data;
    },

    // GET /api/admin/vehicles/pending
    getPendingVehicles: async () => {
        const res = await api.get('/admin/vehicles/pending');
        return res.data;
    },

    // GET /api/admin/vehicles/{id}
    getVehicleDetail: async (id: number | string) => {
        const res = await api.get(`/admin/vehicles/${id}`);
        return res.data;
    },

    // PUT /api/admin/vehicles/{id}/approve
    approveVehicle: async (id: number | string) => {
        const res = await api.put(`/admin/vehicles/${id}/approve`);
        return res.data;
    },

    // PUT /api/admin/vehicles/{id}/reject
    rejectVehicle: async (id: number | string, reason: string) => {
        const res = await api.put(`/admin/vehicles/${id}/reject`, { reason });
        return res.data;
    },

    // Helper to open document image in new tab
    viewDocumentImage: (imageUrl: string) => {
        if (imageUrl) {
            window.open(imageUrl, '_blank');
        }
    }
};

export default adminVehicleApi;
