import api from '@/services/axios';

// ── Backend URL: /api/v1/agent/notifications ───────
// AgentNotificationController.java — Token based
// agentId is not in URL — Secure ✅

const agentNotificationApi = {

    // GET /api/v1/agent/notifications
    // Agent automatically resolved from Token
    getAllNotifications: async () => {
        const res = await api.get(
            '/v1/agent/notifications');
        return res.data;
    },

    // PATCH /api/v1/agent/notifications/{id}/read
    markAsRead: async (notificationId) => {
        const res = await api.patch(
            `/v1/agent/notifications/${notificationId}/read`);
        return res.data;
    },

    // PATCH /api/v1/agent/notifications/read-all
    markAllAsRead: async () => {
        const res = await api.patch(
            '/v1/agent/notifications/read-all');
        return res.data;
    },

    // DELETE /api/v1/agent/notifications/{id}
    deleteNotification: async (notificationId) => {
        const res = await api.delete(
            `/v1/agent/notifications/${notificationId}`);
        return res.data;
    },
};

export default agentNotificationApi;
