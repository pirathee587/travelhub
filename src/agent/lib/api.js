const BASE_URL = "http://localhost:8080/api/v1";

// Resolves the current agent's ID from the logged-in user (set by AuthContext
// after a successful /api/auth/login call). Falls back to 1 only if nothing
// is stored yet, so the dashboard doesn't hard-crash before login resolves.
export function getAgentId() {
    try {
        const stored = localStorage.getItem("user");
        if (stored) {
            const user = JSON.parse(stored);
            if (user?.agentId) return user.agentId;
        }
    } catch {
        // ignore parse errors, fall through to default
    }
    return 1;
}

export const api = {
    // Profile
    getProfile: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/profile`).then(r => r.json()),
    updateProfile: (data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    // Vehicles
    getVehicles: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles`).then(r => r.json()),
    getActiveVehicles: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles?lifecycleStatus=active`).then(r => r.json()),
    createVehicle: (data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateVehicle: (vehicleId, data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles/${vehicleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateVehicleStatus: (vehicleId, status) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles/${vehicleId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        }).then(r => r.json()),
    updateVehicleLifecycle: (vehicleId, lifecycleStatus) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles/${vehicleId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lifecycleStatus })
        }).then(r => r.json()),
    deleteVehicle: (vehicleId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/vehicles/${vehicleId}`, {
            method: "DELETE"
        }),

    // Drivers
    getDrivers: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers`).then(r => r.json()),
    createDriver: (data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateDriver: (driverId, data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers/${driverId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateDriverStatus: (driverId, status) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers/${driverId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        }).then(r => r.json()),
    updateDriverLifecycle: (driverId, lifecycleStatus) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers/${driverId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lifecycleStatus })
        }).then(r => r.json()),
    deleteDriver: (driverId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/drivers/${driverId}`, {
            method: "DELETE"
        }),

    // Bookings
    getBookings: (status) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings${status ? `?status=${status}` : ""}`).then(r => r.json()),
    getBookingById: (bookingId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}`).then(r => r.json()),

    // pending → confirmed (agent accepts, assigns vehicle)
    acceptBooking: (bookingId, vehicleId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}/accept`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId })
        }).then(r => r.json()),

    // pending → cancelled (agent declines with reason)
    declineBooking: (bookingId, declineReason) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}/decline`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ declineReason })
        }).then(r => r.json()),

    // confirmed → in_progress (agent manually starts the trip on trip day)
    startTrip: (bookingId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}/start`, {
            method: "PATCH"
        }).then(r => r.json()),

    // in_progress → completed (agent manually marks trip as done)
    completeBooking: (bookingId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}/complete`, {
            method: "PATCH"
        }).then(r => r.json()),

    // confirmed or in_progress → cancelled (emergency cancellation)
    cancelBooking: (bookingId, cancelReason) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/bookings/${bookingId}/cancel`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cancelReason })
        }).then(r => r.json()),

    // Dashboard
    getDashboardStats: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/dashboard/stats`).then(r => r.json()),

    // Analytics
    getAnalytics: (period = "monthly") =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/analytics?period=${period}`).then(r => r.json()),

    // Reviews
    getReviews: (rating) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/reviews${rating ? `?rating=${rating}` : ""}`).then(r => r.json()),
    replyToReview: (reviewId, reply) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/reviews/${reviewId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply })
        }).then(r => r.json()),

    // Notifications
    getNotifications: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/notifications`).then(r => r.json()),
    markNotificationRead: (notificationId) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/notifications/${notificationId}/read`, {
            method: "PATCH"
        }).then(r => r.json()),
    markAllNotificationsRead: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/notifications/read-all`, {
            method: "PATCH"
        }),

    // Settings
    getSettings: () =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/settings`).then(r => r.json()),
    updateSettings: (data) =>
        fetch(`${BASE_URL}/agent/${getAgentId()}/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    // Packages (read only — teammate's endpoints)
    getPackages: () =>
        fetch(`${BASE_URL}/packages`).then(r => r.json()),
    getPackageById: (packageId) =>
        fetch(`${BASE_URL}/packages/${packageId}`).then(r => r.json()),

    // Notifications
deleteNotification: (notificationId) =>
  fetch(`${BASE_URL}/agent/${getAgentId()}/notifications/${notificationId}`, {
    method: 'DELETE'
  }),
};