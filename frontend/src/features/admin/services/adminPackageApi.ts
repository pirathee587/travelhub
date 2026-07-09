import api from '@/services/axios';

const adminPackageApi = {

    // GET /api/admin/packages
    getAllPackages: async () => {
        const res = await api.get('/admin/packages');
        return res.data;
    },

    // GET /api/admin/packages/status?status=Pending
    getPackagesByStatus: async (status) => {
        const res = await api.get(
            '/admin/packages/status', {
            params: { status },
        });
        return res.data;
    },

    // GET /api/admin/packages/{id}
    // View Button → Full detail
    getPackageDetail: async (id) => {
        const res = await api.get(
            `/admin/packages/${id}`);
        return res.data;
    },

    // PATCH /api/admin/packages/{id}/approve
    approvePackage: async (id) => {
        const res = await api.patch(
            `/admin/packages/${id}/approve`);
        return res.data;
    },

    // PATCH /api/admin/packages/{id}/reject
    rejectPackage: async (id, reason) => {
        const res = await api.patch(
            `/admin/packages/${id}/reject`,
            { reason });
        return res.data;
    },

    // PATCH /api/admin/packages/{id}/toggle-active
    togglePackageActive: async (id) => {
        const res = await api.patch(
            `/admin/packages/${id}/toggle-active`);
        return res.data;
    },

    // DELETE /api/admin/packages/{id}
    deletePackage: async (id) => {
        const res = await api.delete(
            `/admin/packages/${id}`);
        return res.data;
    },
};

export default adminPackageApi;
