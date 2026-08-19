const getBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_API_URL;
    if (!rawUrl) return "http://localhost:8080/api/v1";
    const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api/v1')) return cleanUrl;
    if (cleanUrl.endsWith('/api')) return cleanUrl + '/v1';
    return cleanUrl + '/api/v1';
};
const BASE_URL = getBaseUrl();

// Dynamically retrieve the logged-in agent ID (User ID) from localStorage, no fallback
const AGENT_ID = {
    toString() {
        const userStr = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return String(user.id || user.userId || user.agentId || user.ownerId || '');
            } catch (e) {
                return '';
            }
        }
        return '';
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('travelhub_token') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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
    deleteAgentPackage: async (packageId: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/${packageId}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            const json = await res.json().catch(() => null);
            const msg = json?.message || json?.error || `Failed to delete package (Status ${res.status})`;
            throw new Error(msg);
        }
        return true;
    },
    uploadPackageImage: async (imageFile: File) => {
        const form = new FormData();
        form.append('image', imageFile);
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/packages/upload-image`, {
            method: 'POST',
            headers,
            body: form,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data || !data.imageUrl) {
            const errorMsg = data?.message || data?.error || `Upload failed with status ${res.status}`;
            throw new Error(errorMsg);
        }
        return data;
    },
    searchHotels: (query: string, district: string) => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (district) params.append('district', district);
        const qString = params.toString() ? `?${params.toString()}` : '';
        // Note: Hotel search is at /api/hotels/search, not /api/v1/hotels/search
        const rawApiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const apiBase = rawApiBase.replace(/\/+$/, '').endsWith('/api') ? rawApiBase.replace(/\/+$/, '') : `${rawApiBase.replace(/\/+$/, '')}/api`;
        return fetch(`${apiBase}/hotels/search${qString}`).then(r => r.json());
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
    createVehicle: async (data: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(data)
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || (json && (json.success === false || json.error))) {
            const msg = json?.message || json?.error || `Vehicle creation failed (Status ${res.status})`;
            throw new Error(msg);
        }
        return json;
    },
    updateVehicle: async (vehicleId: any, data: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(data)
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || (json && (json.success === false || json.error))) {
            const msg = json?.message || json?.error || `Vehicle update failed (Status ${res.status})`;
            throw new Error(msg);
        }
        return json;
    },
    updateVehicleStatus: async (vehicleId: any, status: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ status })
        });
        return res.json();
    },
    updateVehicleLifecycle: async (vehicleId: any, lifecycleStatus: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ lifecycleStatus })
        });
        return res.json();
    },
    deleteVehicle: async (vehicleId: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/vehicles/${vehicleId}`, {
            method: "DELETE",
            headers
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || (json && (json.success === false || json.error))) {
            const msg = json?.message || json?.error || `Vehicle delete failed (Status ${res.status})`;
            throw new Error(msg);
        }
        return json;
    },

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
    getDrivers: (startDate?: string, endDate?: string, lifecycleStatus?: string) => {
        const params = new URLSearchParams();
        if (lifecycleStatus) params.append('lifecycleStatus', lifecycleStatus);
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
    updateDriverStatus: async (driverId: any, status: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ status })
        });
        return res.json();
    },
    updateDriverLifecycle: async (driverId: any, lifecycleStatus: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}/lifecycle`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ lifecycleStatus })
        });
        return res.json();
    },
    deleteDriver: async (driverId: any) => {
        const headers = getAuthHeaders();
        const res = await fetch(`${BASE_URL}/agent/${AGENT_ID}/drivers/${driverId}`, {
            method: "DELETE",
            headers
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || (json && (json.success === false || json.error))) {
            const msg = json?.message || json?.error || `Driver delete failed (Status ${res.status})`;
            throw new Error(msg);
        }
        return json;
    },

    // Bookings
    getBookings: (status) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings${status ? `?status=${status}` : ""}`).then(r => r.json()),
    getBookingById: (bookingId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}`).then(r => r.json()),

    // pending → confirmed (agent accepts, assigns vehicle, driver, and hotel)
    acceptBooking: (bookingId, vehicleId, driverId, hotelId) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/bookings/${bookingId}/accept`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId, driverId, hotelId })
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
        fetch(`${BASE_URL}/agent/${AGENT_ID}/dashboard/stats`, {
            headers: { ...getAuthHeaders() }
        }).then(r => r.json()),

    // Analytics
    getAnalytics: (period = "monthly") =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/analytics?period=${period}`, {
            headers: { ...getAuthHeaders() }
        }).then(r => r.json()),

    // Agent Wallet (used in Analytics page)
    getAgentWallet: () => {
        const rawUrl = import.meta.env.VITE_API_URL;
        const walletBase = rawUrl
            ? rawUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '/api').replace(/\/api$/, '/api')
            : 'http://localhost:8080/api';
        return fetch(`${walletBase}/agency/wallet/${AGENT_ID}`, {
            headers: { ...getAuthHeaders() }
        }).then(r => r.json());
    },

    // Reviews
    getReviews: (rating) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/reviews${rating ? `?rating=${rating}` : ""}`, {
            headers: { ...getAuthHeaders() }
        }).then(r => r.json()),
    replyToReview: (reviewId, reply) =>
        fetch(`${BASE_URL}/agent/${AGENT_ID}/reviews/${reviewId}/reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ reply })
        }).then(r => r.json()),

    // Notifications
    getNotifications: () =>
        fetch(`${BASE_URL}/agent/notifications`, {
            headers: { ...getAuthHeaders() }
        }).then(r => r.json()),
    markNotificationRead: (notificationId) =>
        fetch(`${BASE_URL}/agent/notifications/${notificationId}/read`, {
            method: "PATCH",
            headers: { ...getAuthHeaders() }
        }).then(r => r.json()),
    markAllNotificationsRead: () =>
        fetch(`${BASE_URL}/agent/notifications/read-all`, {
            method: "PATCH",
            headers: { ...getAuthHeaders() }
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
            method: 'DELETE',
            headers: { ...getAuthHeaders() }
        }),
};