import api from './api';

const touristService = {
    // Dashboard Stats
    getStats: (userId) => api.get('/tourist/stats', { params: { userId } }).then(res => res.data),
    getRecentTrips: (userId) => api.get('/tourist/trips/recent', { params: { userId } }).then(res => res.data),

    // Bookings & Trips
    getBookings: (userId) => api.get('/tourist/bookings', { params: { userId } }).then(res => res.data),
    getBooking: (id) => api.get(`/tourist/bookings/${id}`).then(res => res.data),
    createBooking: (data) => api.post('/tourist/bookings', data).then(res => res.data),
    cancelBooking: (id) => api.put(`/tourist/bookings/${id}/cancel`).then(res => res.data),
    
    getTrips: (userId, status) => api.get('/tourist/trips', { params: { userId, status } }).then(res => res.data),
    getTrip: (id) => api.get(`/tourist/trips/${id}`).then(res => res.data),

    // Documents
    getDocuments: (userId, type) => api.get('/tourist/documents', { params: { userId, type } }).then(res => res.data),
    getDocument: (id) => api.get(`/tourist/documents/${id}`).then(res => res.data),
};

export default touristService;
