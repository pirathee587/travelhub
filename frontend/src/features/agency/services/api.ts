const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api/v1";

// Dynamically retrieve the logged-in agent ID (User ID) from localStorage, no fallback
const AGENT_ID = {
  toString() {
    const userStr = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return String(user.id || '');
      } catch (e) {
        return '';
      }
    }
    return '';
  }
};

export const api = {
    // Profile
    getProfile: () =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/profile`).then(r => r.json()),
    updateProfile: (data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    // Packages (agent-owned CRUD)
    getAgentPackages: (search = '', isActive = null) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (isActive !== null) params.set('isActive', isActive);
        const query = params.toString() ? `?${params}` : '';
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/packages${query}`).then(r => r.json());
    },
    getAgentPackage: (packageId) => 
        fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/${packageId}`).then(r => r.json()),
    createPackage: (dataJson, imageFiles = []) => {
        const form = new FormData();
        form.append('data', dataJson);
        imageFiles.forEach(f => form.append('images', f));
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/packages`, {
            method: 'POST',
            body: form,
        }).then(r => r.json());
    },
    updateAgentPackage: (packageId, dataJson, imageFiles = []) => {
        const form = new FormData();
        form.append('data', dataJson);
        imageFiles.forEach(f => form.append('images', f));
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/${packageId}`, {
            method: 'PUT',
            body: form,
        }).then(r => r.json());
    },
    deleteAgentPackage: (packageId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/${packageId}`, {
            method: 'DELETE',
        }),
    uploadPackageImage: (imageFile) => {
        const form = new FormData();
        form.append('image', imageFile);
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/upload-image`, {
            method: 'POST',
            body: form,
        }).then(r => r.json());
    },
    searchHotels: (query: string, district: string) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (district) params.append('district', district);
        const qString = params.toString() ? `?${params.toString()}` : '';
        // Note: Hotel search is at /api/hotels/search, not /api/v1/hotels/search
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
        return fetch(`${apiBase}/api/hotels/search${qString}`).then(r => r.json());
    },

    // Vehicles
    getVehicles: () =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles`).then(r => r.json()),
    getActiveVehicles: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams({ lifecycleStatus: 'active' });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles?${params.toString()}`).then(r => r.json());
    },
    createVehicle: (data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateVehicle: (vehicleId, data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateVehicleStatus: (vehicleId, status) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        }).then(r => r.json()),
    updateVehicleLifecycle: (vehicleId, lifecycleStatus) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lifecycleStatus })
        }).then(r => r.json()),
    deleteVehicle: (vehicleId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}`, {
            method: "DELETE"
        }),

    // Owners
    getOwners: () =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/owners`).then(r => r.json()),
    createOwner: (data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/owners`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),

    // Drivers
    getDrivers: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers${query}`).then(r => r.json());
    },
    createDriver: (data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateDriver: (driverId, data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
    updateDriverStatus: (driverId, status) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        }).then(r => r.json()),
    updateDriverLifecycle: (driverId, lifecycleStatus) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lifecycleStatus })
        }).then(r => r.json()),
    deleteDriver: (driverId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}`, {
            method: "DELETE"
        }),

    // Bookings
    getBookings: (status) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings${status ? `?status=${status}` : ""}`).then(r => r.json()),
    getBookingById: (bookingId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}`).then(r => r.json()),

    // pending → confirmed (agent accepts, assigns vehicle)
    acceptBooking: (bookingId, vehicleId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/accept`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId })
        }).then(r => r.json()),

    assignVehicle: (bookingId, vehicleId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/assign-vehicle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId })
        }).then(r => r.json()),

    assignDriver: (bookingId, driverId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/assign-driver`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ driverId })
        }).then(r => r.json()),

    // pending → cancelled (agent declines with reason)
    declineBooking: (bookingId, declineReason) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/decline`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ declineReason })
        }).then(r => r.json()),

    // confirmed → in_progress (agent manually starts the trip on trip day)
    startTrip: (bookingId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/start`, {
            method: "PATCH"
        }).then(r => r.json()),

    // in_progress → completed (agent manually marks trip as done)
    completeBooking: (bookingId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/complete`, {
            method: "PATCH"
        }).then(r => r.json()),

    // confirmed or in_progress → cancelled (emergency cancellation)
    cancelBooking: (bookingId, cancelReason) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/cancel`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cancelReason })
        }).then(r => r.json()),

    // Dashboard
    getDashboardStats: () =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/dashboard/stats`).then(r => r.json()),

    // Analytics
    getAnalytics: (period = "monthly") =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/analytics?period=${period}`).then(r => r.json()),

    // Reviews
    getReviews: (rating) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/reviews${rating ? `?rating=${rating}` : ""}`).then(r => r.json()),
    replyToReview: (reviewId, reply) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/reviews/${reviewId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply })
        }).then(r => r.json()),

    // Notifications
    getNotifications: () =>
        fetch(`${BASE_URL}/agent/notifications`).then(r => r.json()),
    markNotificationRead: (notificationId) =>
        fetch(`${BASE_URL}/agent/notifications/${notificationId}/read`, {
            method: "PATCH"
        }).then(r => r.json()),
    markAllNotificationsRead: () =>
        fetch(`${BASE_URL}/agent/notifications/read-all`, {
            method: "PATCH"
        }),

    // Settings
    getSettings: () =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/settings`).then(r => r.json()),
    updateSettings: (data) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/settings`, {
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
        fetch(`${BASE_URL}/agent/notifications/${notificationId}`, {
            method: 'DELETE'
        }),
};