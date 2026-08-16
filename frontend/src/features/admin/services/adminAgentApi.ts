import api from '@/services/axios';

const adminAgentApi = {

    // GET /api/admin/agents
    getAllAgents: async () => {
        const res = await api.get('/admin/agents');
        return res.data;
    },

    // GET /api/admin/agents/status?status=Pending
    getAgentsByStatus: async (status: string) => {
        const res = await api.get(
            '/admin/agents/status', {
            params: { status },
        });
        return res.data;
    },

    // GET /api/admin/agents/search?keyword=
    searchAgents: async (keyword: string) => {
        const res = await api.get(
            '/admin/agents/search', {
            params: { keyword },
        });
        return res.data;
    },

    // GET /api/admin/agents/{id}
    // View Button → Full detail
    getAgentDetail: async (id: number | string) => {
        const res = await api.get(`/admin/agents/${id}`);
        return res.data;
    },

    // GET /api/admin/agents/{id}/packages
    // Packages Button
    getAgentPackages: async (id: number | string) => {
        const res = await api.get(
            `/admin/agents/${id}/packages`);
        return res.data;
    },

    // GET /api/admin/analytics/{id}/stats
    getAgentStats: async (id: number | string) => {
        const res = await api.get(
            `/admin/analytics/${id}/stats`);
        return res.data;
    },

    // GET /api/admin/analytics/{id}/revenue?year=
    getAgentRevenue: async (id: number | string, year?: number | string) => {
        const res = await api.get(
            `/admin/analytics/${id}/revenue`, {
            params: { year },
        });
        return res.data;
    },

    // GET /api/admin/analytics/{id}/trip-status
    getAgentTripStatus: async (id: number | string) => {
        const res = await api.get(
            `/admin/analytics/${id}/trip-status`);
        return res.data;
    },

    // GET /api/v1/agent/{id}/analytics?period=
    getAgentFullAnalytics: async (id: number | string, period = "monthly") => {
        const res = await api.get(
            `/v1/agent/${id}/analytics`, {
            params: { period },
        });
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/approve
    approveAgent: async (ownerId: number | string) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/approve`);
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/reject
    rejectAgent: async (ownerId: number | string, reason?: string) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/reject`,
            reason ? { reason } : {});
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/suspend
    suspendAgent: async (ownerId: number | string, message?: string) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/suspend`,
            message ? { message } : {});
        return res.data;
    },

    // PATCH /api/admin/users/agents/{ownerId}/unsuspend
    unsuspendAgent: async (ownerId: number | string) => {
        const res = await api.patch(
            `/admin/users/agents/${ownerId}/unsuspend`);
        return res.data;
    },

    // PATCH /api/admin/agents/{id}/toggle-active
    toggleAgentActive: async (id: number | string) => {
        const res = await api.patch(
            `/admin/agents/${id}/toggle-active`);
        return res.data;
    },

    // DELETE /api/admin/agents/{id}
    deleteAgent: async (id: number | string) => {
        const res = await api.delete(
            `/admin/agents/${id}`);
        return res.data;
    },

    // View NIC
    viewAgentNIC: (nicImageUrl: string) => {
        window.open(nicImageUrl, '_blank');
    },
};

export default adminAgentApi;
