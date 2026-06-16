import api from './api';

const ownerService = {
    // Dashboard Stats
    getDashboardStats: (hotelId) => api.get(`/v1/owner/dashboard/hotel/${hotelId}`).then(res => res.data),

    // Hotels
    getHotels: (status) => api.get('/v1/owner/hotels', { params: { status } }).then(res => res.data),
    createHotel: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'hotelImage' && data[key]) {
                formData.append('hotelImage', data[key]);
            } else {
                formData.append(key, data[key]);
            }
        });
        return api.post('/v1/owner/hotels', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    updateHotel: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (key === 'hotelImage' && data[key]) {
                formData.append('hotelImage', data[key]);
            } else {
                formData.append(key, data[key]);
            }
        });
        return api.put(`/v1/owner/hotels/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    deleteHotel: (id) => api.delete(`/v1/owner/hotels/${id}`).then(res => res.data),

    // Profile
    getProfile: () => api.get('/v1/owner/profile').then(res => res.data),
    updateProfile: (data) => api.put('/v1/owner/profile', data).then(res => res.data),
    uploadProfileImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/v1/owner/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },

    // Rooms (assuming room API exists or using a generic one)
    getRooms: (hotelId) => api.get(`/v1/rooms/hotel/${hotelId}`).then(res => res.data),
    addRoom: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        return api.post('/v1/rooms', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    updateRoom: (id, data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        return api.put(`/v1/rooms/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    deleteRoom: (id) => api.delete(`/v1/rooms/${id}`).then(res => res.data),
    updateRoomAvailability: (id, availability) => api.patch(`/v1/rooms/${id}/availability`, null, { params: { availability } }).then(res => res.data),
};

export default ownerService;
