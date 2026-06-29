import api from '@/services/axios';

// ── Backend URL: /api/admin/notifications ──────────
// AdminNotificationController.java matches exactly

const adminNotificationApi = {

    // GET /api/admin/notifications
    // All notifications — latest first
    getAllNotifications: async () => {
        const res = await api.get(
            '/admin/notifications');
        return res.data;
    },

    // GET /api/admin/notifications/unread
    // Unread notifications
    getUnreadNotifications: async () => {
        const res = await api.get(
            '/admin/notifications/unread');
        return res.data;
    },

    // GET /api/admin/notifications/count
    // Bell icon 🔔 number — 5, 12 etc
    getUnreadCount: async () => {
        const res = await api.get(
            '/admin/notifications/count');
        return res.data;
    },

    // GET /api/admin/notifications/latest
    // Dashboard Top 10 recent activity
    getLatestNotifications: async () => {
        const res = await api.get(
            '/admin/notifications/latest');
        return res.data;
    },

    // GET /api/admin/notifications/type?type=
    // type values:
    // agent_registration | hotel_registration
    // package_registration | booking
    // payment | review | cancellation | system
    getNotificationsByType: async (type) => {
        const res = await api.get(
            '/admin/notifications/type',
            { params: { type } });
        return res.data;
    },

    // PATCH /api/admin/notifications/{id}/read
    // Mark one notification as read
    markAsRead: async (id) => {
        const res = await api.patch(
            `/admin/notifications/${id}/read`);
        return res.data;
    },

    // PATCH /api/admin/notifications/read-all
    // Mark all notifications as read
    markAllAsRead: async () => {
        const res = await api.patch(
            '/admin/notifications/read-all');
        return res.data;
    },

    // DELETE /api/admin/notifications/{id}
    deleteNotification: async (id) => {
        const res = await api.delete(
            `/admin/notifications/${id}`);
        return res.data;
    },
};

export default adminNotificationApi;
