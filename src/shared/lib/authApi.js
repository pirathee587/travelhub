import api from "./api";

const authApi = {
    // POST /api/auth/login
    // Response: { token, name, email, role, profileImage, agentId, hotelId, id }
    login: async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        return res.data;
    },

    // POST /api/auth/register
    register: async (data) => {
        const res = await api.post("/auth/register", data);
        return res.data;
    },

    // POST /api/auth/forgot-password
    forgotPassword: async (email) => {
        const res = await api.post("/auth/forgot-password", { email });
        return res.data;
    },

    // POST /api/auth/reset-password
    resetPassword: async (token, newPassword) => {
        const res = await api.post("/auth/reset-password", { token, newPassword });
        return res.data;
    },
};

export default authApi;
