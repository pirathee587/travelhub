import api from '../axios';

const adminAnalyticsApi = {

    // GET /api/admin/agents/{id}/stats
    getAgentStats: async (agentId) => {
        const res = await api.get(
            `/admin/agents/${agentId}/stats`);
        return res.data;
    },

    // GET /api/admin/agents/{id}/revenue?year=
    getAgentMonthlyRevenue: async (agentId, year) => {
        const res = await api.get(
            `/admin/agents/${agentId}/revenue`, {
            params: { year },
        });
        return res.data;
    },

    // GET /api/admin/agents/{id}/trip-status
    getAgentTripStatus: async (agentId) => {
        const res = await api.get(
            `/admin/agents/${agentId}/trip-status`);
        return res.data;
    },
};

export default adminAnalyticsApi;
