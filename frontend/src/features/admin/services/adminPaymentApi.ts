import api from '@/services/axios';

const adminPaymentApi = {

    // GET /api/admin/payments/stats
    getPaymentStats: async () => {
        const res = await api.get('/admin/payments/stats');
        return res.data;
    },

    // GET /api/admin/payments
    getAllPayments: async () => {
        const res = await api.get('/admin/payments');
        return res.data;
    },

    // GET /api/admin/payments?type=Payment&status=Completed
    filterPayments: async ({ type, status } = {}) => {
        const params = {};
        if (type)   params.type   = type;
        if (status) params.status = status;
        const res = await api.get('/admin/payments', { params });
        return res.data;
    },

    // GET /api/admin/payments/{id}
    getPaymentById: async (id) => {
        const res = await api.get(`/admin/payments/${id}`);
        return res.data;
    },

    // GET /api/admin/payments/revenue
    getTotalRevenue: async () => {
        const res = await api.get('/admin/payments/revenue');
        return res.data;
    },

    // PATCH /api/admin/payments/{id}/status
    // body: { status: 'Completed' }
    updatePaymentStatus: async (id, status) => {
        const res = await api.patch(`/admin/payments/${id}/status`, { status });
        return res.data;
    },
};

export default adminPaymentApi;
