import api from '@/services/axios';

const adminAgentApi = {

    // GET /api/admin/agents
    getAllAgents: async () => {
        const res = await api.get('/admin/agents');
        return res.data;
    },

    // GET /api/admin/agents/status?status=Pending
    getAgentsByStatus: async (status) => {
        const res = await api.get(
            '/admin/agents/status', {
            params: { status },
        });
        return res.data;
    },

    // GET /api/admin/agents/search?keyword=
    searchAgents: async (keyword) => {
        const res = await api.get(
            '/admin/agents/search', {
            params: { keyword },
        });
        return res.data;
    },

    // GET /api/admin/agents/{id}
    // View Button → Full detail
    getAgentDetail: async (id) => {
        const res = await api.get(`/admin/agents/${id}`);
        return res.data;
    },

    // GET /api/admin/agents/{id}/packages
    // Packages Button
    getAgentPackages: async (id) => {
        const res = await api.get(
            `/admin/agents/${id}/packages`);
        return res.data;
    },

    // GET /api/admin/analytics/{id}/stats
    getAgentStats: async (id) => {
        const res = await api.get(
            `/admin/analytics/${id}/stats`);
        return res.data;
    },

    // GET /api/admin/analytics/{id}/revenue?year=
    getAgentRevenue: async (id, year) => {
        const res = await api.get(
            `/admin/analytics/${id}/revenue`, {
            params: { year },
        });
        return res.data;
    },

    // GET /api/admin/analytics/{id}/trip-status
    getAgentTripStatus: async (id) => {
        const res = await api.get(
            `/admin/analytics/${id}/trip-status`);
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/approve
    // Per architecture schema: {id} is User/Owner ID — handled by AdminUserController
    approveAgent: async (ownerId) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/approve`);
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/reject
    // Per architecture schema: {id} is User/Owner ID — handled by AdminUserController
    rejectAgent: async (ownerId, reason) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/reject`,
            reason ? { reason } : {});
        return res.data;
    },

    // PATCH /api/admin/agents/{id}/toggle-active
    toggleAgentActive: async (id) => {
        const res = await api.patch(
            `/admin/agents/${id}/toggle-active`);
        return res.data;
    },

    // DELETE /api/admin/agents/{id}
    deleteAgent: async (id) => {
        const res = await api.delete(
            `/admin/agents/${id}`);
        return res.data;
    },

    // View NIC
    viewAgentNIC: (nicImageUrl) => {
        window.open(nicImageUrl, '_blank');
    },
};

export default adminAgentApi;
