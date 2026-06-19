import api from './api';

const adminService = {
    // User Management
    getPendingUsers: async () => {
        const response = await api.get('/admin/users/pending-agents');
        return response.data.data;
    },
    approveUser: async (userId) => {
        const response = await api.patch(`/admin/users/agents/${userId}/approve`);
        return response.data;
    },
    rejectUser: async (userId, reason) => {
        const response = await api.patch(`/admin/users/agents/${userId}/reject`, { reason });
        return response.data;
    },

    // Agent Analytics (for Admin)
    getAllAgents: () => api.get('/admin/analytics').then(res => res.data.data),
    getAgentStats: (agentId) => api.get(`/admin/analytics/${agentId}/stats`).then(res => res.data.data),
    getAgentRevenue: (agentId, year) => api.get(`/admin/analytics/${agentId}/revenue`, { params: { year } }).then(res => res.data.data),
    getAgentTripStatus: (agentId) => api.get(`/admin/analytics/${agentId}/trip-status`).then(res => res.data.data),
    
    // Global Dashboard
    getDashboardStats: () => api.get('/admin/dashboard').then(res => res.data.data),
};

export default adminService;
