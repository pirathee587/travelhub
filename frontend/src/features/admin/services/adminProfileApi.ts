import api from '@/services/axios';

const adminProfileApi = {

    // ── GET /api/users/me ──────────────────────────
    // Profile tab-ல் name, email load செய்ய
    getProfile: async () => {
        const res = await api.get('/users/me');
        return res.data;
    },

    // ── PUT /api/users/profile ─────────────────────
    // Profile tab & Settings → Save changes button
    // Accepts either individual arguments or an object payload
    updateProfile: async (nameOrPayload: any, email?: string, profileImage?: string, telephone?: string, currencyPreference?: string) => {
        let payload: any;
        if (typeof nameOrPayload === 'object' && nameOrPayload !== null) {
            payload = nameOrPayload;
        } else {
            payload = {
                name: nameOrPayload,
                email,
                profileImage,
                telephone,
                currencyPreference
            };
        }
        const res = await api.put('/users/profile', payload);
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
