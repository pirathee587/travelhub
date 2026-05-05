import api from '../axios';

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

    // GET /api/admin/agents/{id}/stats
    getAgentStats: async (id) => {
        const res = await api.get(
            `/admin/agents/${id}/stats`);
        return res.data;
    },

    // GET /api/admin/agents/{id}/revenue?year=
    getAgentRevenue: async (id, year) => {
        const res = await api.get(
            `/admin/agents/${id}/revenue`, {
            params: { year },
        });
        return res.data;
    },

    // GET /api/admin/agents/{id}/trip-status
    getAgentTripStatus: async (id) => {
        const res = await api.get(
            `/admin/agents/${id}/trip-status`);
        return res.data;
    },

    // PATCH /api/admin/agents/{id}/approve
    approveAgent: async (id) => {
        const res = await api.patch(
            `/admin/agents/${id}/approve`);
        return res.data;
    },

    // PATCH /api/admin/agents/{id}/reject
    rejectAgent: async (id, reason) => {
        const res = await api.patch(
            `/admin/agents/${id}/reject`,
            { reason });
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
