import api from '@/services/axios';

const adminUserApi = {

    // GET /api/admin/users
    getAllUsers: async () => {
        const res = await api.get('/admin/users');
        return res.data;
    },

    // GET /api/admin/users/{id}
    getUserById: async (id) => {
        const res = await api.get(`/admin/users/${id}`);
        return res.data;
    },

    // GET /api/admin/users/role?role=AGENT
    getUsersByRole: async (role) => {
        const res = await api.get('/admin/users/role', {
            params: { role },
        });
        return res.data;
    },

    // GET /api/admin/users/search?keyword=
    searchUsers: async (keyword) => {
        const res = await api.get('/admin/users/search', {
            params: { keyword },
        });
        return res.data;
    },

    // GET /api/admin/users/pending-agents
    getPendingAgents: async () => {
        const res = await api.get(
            '/admin/users/pending-agents');
        return res.data;
    },

    // PATCH /api/admin/users/{id}/toggle-active
    toggleUserActive: async (id) => {
        const res = await api.patch(
            `/admin/users/${id}/toggle-active`);
        return res.data;
    },

    // PATCH /api/admin/users/agents/{id}/approve
    approveAgent: async (id) => {
        const res = await api.patch(
            `/admin/users/agents/${id}/approve`);
        return res.data;
    },

    // PATCH /api/admin/users/agents/{id}/reject
    rejectAgent: async (id, reason) => {
        const res = await api.patch(
            `/admin/users/agents/${id}/reject`,
            { reason });
        return res.data;
    },

    // DELETE /api/admin/users/{id}
    deleteUser: async (id) => {
        const res = await api.delete(
            `/admin/users/${id}`);
        return res.data;
    },
};

export default adminUserApi;
