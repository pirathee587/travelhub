import { useState, useEffect, useCallback }
    from 'react';
import adminNotificationApi
    from '../services/adminNotificationApi';

export const useAdminNotifications = () => {

    const [notifications, setNotifications] =
            useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // ── Fetch All Notifications ────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminNotificationApi
                    .getAllNotifications();
            setNotifications(res || []);
        } catch (err) {
            setError(
                err.response?.data?.message
                || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch Unread Count ─────────────────────────
    // Bell icon 🔔5 — every 30s auto refresh
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await adminNotificationApi
                    .getUnreadCount();
            // API returns { count: N } directly
            setUnreadCount(res?.count ?? 0);
        } catch (err) {
            console.error('Count failed:', err);
        }
    }, []);

    // ── Mark One As Read ───────────────────────────
    const markAsRead = async (id) => {
        try {
            await adminNotificationApi.markAsRead(id);

            // Local state update — no re-fetch needed
            setNotifications(prev =>
                prev.map(n =>
                    n.id === id
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
            await adminNotificationApi.markAllAsRead();

            // Local state update
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all failed:', err);
        }
    };

    // ── Delete Notification ────────────────────────
    const deleteNotification = async (id) => {
        try {
            await adminNotificationApi
                    .deleteNotification(id);

            // Remove from local state
            const deleted = notifications
                    .find(n => n.id === id);
            setNotifications(prev =>
                prev.filter(n => n.id !== id));

            // Update count if unread
            if (deleted && !deleted.read) {
                setUnreadCount(prev =>
                    prev > 0 ? prev - 1 : 0);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // ── Auto fetch on mount ────────────────────────
    // Poll count every 30 seconds
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [fetchNotifications, fetchUnreadCount]);

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
