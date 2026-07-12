import { useState, useEffect, useCallback }
    from 'react';
import agentNotificationApi
    from '../services/agentNotificationApi';

export const useAgentNotifications = () => {

    const [notifications, setNotifications] =
            useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // ── Fetch All ──────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await agentNotificationApi
                    .getAllNotifications();
            const data = res.data || [];
            setNotifications(data);

            // Count unread from data
            const unread = data.filter(
                n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            setError(
                err.response?.data?.message
                || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Mark One As Read ───────────────────────────
    const markAsRead = async (notificationId) => {
        try {
            await agentNotificationApi
                    .markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read: true }
                        : n));
            setUnreadCount(prev =>
                prev > 0 ? prev - 1 : 0);
        } catch (err) {
            console.error('Mark read failed:', err);
        }
    };

    // ── Mark All As Read ───────────────────────────
    const markAllAsRead = async () => {
        try {
            await agentNotificationApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all failed:', err);
        }
    };

    // ── Delete ─────────────────────────────────────
    const deleteNotification = async (notificationId) => {
        try {
            await agentNotificationApi
                    .deleteNotification(notificationId);
            const deleted = notifications
                    .find(n => n.id === notificationId);
            setNotifications(prev =>
                prev.filter(n => n.id !== notificationId));
            if (deleted && !deleted.read) {
                setUnreadCount(prev =>
                    prev > 0 ? prev - 1 : 0);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // ── Auto fetch + Poll 30s ──────────────────────
    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(
            fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
};
