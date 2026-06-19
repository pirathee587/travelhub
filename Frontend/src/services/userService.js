import api from './api';

const userService = {
    getMe: () => api.get('/users/me').then(res => res.data),
    updateProfile: (data) => api.put('/users/profile', data).then(res => res.data),
    changePassword: (data) => api.post('/users/change-password', data).then(res => res.data),
};

export default userService;
