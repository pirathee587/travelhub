import api from '@/services/axios';

const adminProfileApi = {

    // ── GET /api/users/me ──────────────────────────
    // Profile tab-ல் name, email load செய்ய
    getProfile: async () => {
        const res = await api.get('/users/me');
        return res.data;
    },

    // ── PUT /api/users/profile ─────────────────────
    // Profile tab → Save changes button
    // Body: { name, email, profileImage }
    updateProfile: async (name, email, profileImage) => {
        const res = await api.put('/users/profile', {
            name,
            email,
            profileImage,
        });
        return res.data;
    },

    // ── POST /api/upload/image ─────────────────────
    // Profile photo Upload button
    // multipart/form-data
    uploadProfilePhoto: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post(
            '/upload/image',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return res.data;
    },

    // ── POST /api/users/change-password ───────────
    // Password tab → Save changes button
    // Body: { currentPassword, newPassword }
    changePassword: async (
        oldPassword,
        newPassword
    ) => {
        const res = await api.post(
            '/users/change-password',
            {
                currentPassword: oldPassword,
                newPassword,
            }
        );
        return res.data;
    },
};

export default adminProfileApi;
