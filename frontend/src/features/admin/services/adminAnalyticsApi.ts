import api from '@/services/axios';

const adminAnalyticsApi = {

    // GET /api/admin/analytics/{id}/stats
    getAgentStats: async (agentId) => {
        const res = await api.get(
            `/admin/analytics/${agentId}/stats`);
        return res.data;
    },

    // GET /api/admin/analytics/{id}/revenue?year=
    getAgentMonthlyRevenue: async (agentId, year) => {
        const res = await api.get(
            `/admin/analytics/${agentId}/revenue`, {
            params: { year },
        });
        return res.data;
    },

    // GET /api/admin/analytics/{id}/trip-status
    getAgentTripStatus: async (agentId) => {
        const res = await api.get(
            `/admin/analytics/${agentId}/trip-status`);
        return res.data;
    },
};

export default adminAnalyticsApi;
