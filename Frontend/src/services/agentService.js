import api from './api';

const agentService = {
    // Dashboard Stats
    getStats: (agentId) => api.get(`/v1/agent/${agentId}/dashboard/stats`).then(res => res.data),

    // Packages
    getPackages: (agentId) => api.get(`/v1/agent/${agentId}/packages`).then(res => res.data),
    getPackage: (id) => api.get(`/packages/${id}`).then(res => res.data),
    createPackage: (agentId, data) => api.post(`/v1/agent/${agentId}/packages`, data).then(res => res.data),
    updatePackage: (agentId, id, data) => api.put(`/v1/agent/${agentId}/packages/${id}`, data).then(res => res.data),
    deletePackage: (agentId, id) => api.delete(`/v1/agent/${agentId}/packages/${id}`).then(res => res.data),

    // Drivers
    getDrivers: (agentId, status) => api.get(`/v1/agent/${agentId}/drivers`, { params: { lifecycleStatus: status } }).then(res => res.data),
    getDriver: (agentId, driverId) => api.get(`/v1/agent/${agentId}/drivers/${driverId}`).then(res => res.data),
    createDriver: (agentId, data) => api.post(`/v1/agent/${agentId}/drivers`, data).then(res => res.data),
    updateDriver: (agentId, driverId, data) => api.put(`/v1/agent/${agentId}/drivers/${driverId}`, data).then(res => res.data),
    updateDriverStatus: (agentId, driverId, status) => api.patch(`/v1/agent/${agentId}/drivers/${driverId}/status`, { status }).then(res => res.data),
    deleteDriver: (agentId, driverId) => api.delete(`/v1/agent/${agentId}/drivers/${driverId}`).then(res => res.data),

    // Vehicles
    getVehicles: (agentId, status) => api.get(`/v1/agent/${agentId}/vehicles`, { params: { lifecycleStatus: status } }).then(res => res.data),
    getVehicle: (agentId, vehicleId) => api.get(`/v1/agent/${agentId}/vehicles/${vehicleId}`).then(res => res.data),
    createVehicle: (agentId, data) => api.post(`/v1/agent/${agentId}/vehicles`, data).then(res => res.data),
    updateVehicle: (agentId, vehicleId, data) => api.put(`/v1/agent/${agentId}/vehicles/${vehicleId}`, data).then(res => res.data),
    updateVehicleStatus: (agentId, vehicleId, status) => api.patch(`/v1/agent/${agentId}/vehicles/${vehicleId}/status`, { status }).then(res => res.data),
    deleteVehicle: (agentId, vehicleId) => api.delete(`/v1/agent/${agentId}/vehicles/${vehicleId}`).then(res => res.data),

    // Bookings
    getBookings: (agentId, status) => api.get(`/v1/agent/${agentId}/bookings`, { params: { status } }).then(res => res.data),
    getBooking: (agentId, bookingId) => api.get(`/v1/agent/${agentId}/bookings/${bookingId}`).then(res => res.data),
    acceptBooking: (agentId, bookingId) => api.patch(`/v1/agent/${agentId}/bookings/${bookingId}/accept`).then(res => res.data),
    declineBooking: (agentId, bookingId, reason) => api.patch(`/v1/agent/${agentId}/bookings/${bookingId}/decline`, { reason }).then(res => res.data),
    completeBooking: (agentId, bookingId) => api.patch(`/v1/agent/${agentId}/bookings/${bookingId}/complete`).then(res => res.data),

    // Analytics
    getAnalytics: (agentId, period) => api.get(`/v1/agent/${agentId}/analytics`, { params: { period } }).then(res => res.data),

    // Notifications
    getNotifications: (agentId) => api.get(`/v1/agent/${agentId}/notifications`).then(res => res.data),
    markNotificationAsRead: (agentId, notificationId) => api.patch(`/v1/agent/${agentId}/notifications/${notificationId}/read`).then(res => res.data),
    markAllNotificationsAsRead: (agentId) => api.patch(`/v1/agent/${agentId}/notifications/read-all`).then(res => res.data),
    deleteNotification: (agentId, notificationId) => api.delete(`/v1/agent/${agentId}/notifications/${notificationId}`).then(res => res.data),

    // Profile
    getProfile: (agentId) => api.get(`/v1/agent/${agentId}/profile`).then(res => res.data),
    updateProfile: (agentId, data) => api.put(`/v1/agent/${agentId}/profile`, data).then(res => res.data),

    // Settings
    getSettings: (agentId) => api.get(`/v1/agent/${agentId}/settings`).then(res => res.data),
    updateSettings: (agentId, data) => api.put(`/v1/agent/${agentId}/settings`, data).then(res => res.data),

    // Reviews
    getReviews: (agentId, rating) => api.get(`/v1/agent/${agentId}/reviews`, { params: { rating } }).then(res => res.data),
    replyToReview: (agentId, reviewId, reply) => api.post(`/v1/agent/${agentId}/reviews/${reviewId}/reply`, { reply }).then(res => res.data),
};

export default agentService;
