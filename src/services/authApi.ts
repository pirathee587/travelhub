import api from './axios';

const authApi = {

    // POST /api/auth/login
    login: async (email: string, password: string) => {
        const res = await api.post('/auth/login', {
            email,
            password,
        });
        return res.data;
    },

    // POST /api/auth/register
    register: async (data: any) => {
        const res = await api.post('/auth/register', data);
        return res.data;
    },

    // GET /api/auth/me
    getMe: async () => {
        const res = await api.get('/auth/me');
        return res.data;
    },

    // POST /api/auth/forgot-password
    forgotPassword: async (email: string) => {
        const res = await api.post(
            '/auth/forgot-password', { email });
        return res.data;
    },

    // POST /api/auth/reset-password
    resetPassword: async (token: string, newPassword: string) => {
        const res = await api.post(
            '/auth/reset-password',
            { token, newPassword });
        return res.data;
    },
};

export default authApi;
