import { useState, useEffect, useCallback } from 'react';
import adminNotificationApi from '../services/adminNotificationApi';

const LS_KEY = 'admin_read_notification_ids';

// ── localStorage helpers ──────────────────────────────────────────────────
function getReadIds(): Set<number> {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as number[]);
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<number>): void {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
    } catch {
        // storage quota exceeded — silently ignore
    }
}

// ── Hook ──────────────────────────────────────────────────────────────────
export const useAdminNotifications = () => {

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState<string | null>(null);

    // Computed from local state — NOT from the broken /count API
    const unreadCount = notifications.filter(n => !n.read).length;

    // ── Merge fetched notifications with persisted read state ──────────
    const applyReadState = useCallback((raw: any[]): any[] => {
        const readIds = getReadIds();
        return raw.map(n => ({
            ...n,
            read: readIds.has(n.id) ? true : Boolean(n.read),
        }));
    }, []);

    // ── Fetch all notifications ───────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminNotificationApi.getAllNotifications();
            setNotifications(applyReadState(res || []));
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [applyReadState]);

    // ── Mark one as read ─────────────────────────────────────────────
    const markAsRead = useCallback(async (id: number) => {
        try {
            // Fire-and-forget — backend is a no-op for admin notifs
            await adminNotificationApi.markAsRead(id);
        } catch {
            // ignore backend error — we persist locally anyway
        }

        // Persist to localStorage
        const ids = getReadIds();
        ids.add(id);
        saveReadIds(ids);

        // Update local state immediately
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    // ── Mark all as read ─────────────────────────────────────────────
    const markAllAsRead = useCallback(async () => {
        try {
            await adminNotificationApi.markAllAsRead();
        } catch {
            // ignore backend error
        }

        // Persist every current notification ID
        const ids = getReadIds();
        setNotifications(prev => {
            prev.forEach(n => ids.add(n.id));
            saveReadIds(ids);
            return prev.map(n => ({ ...n, read: true }));
        });
    }, []);

    // ── Delete notification ──────────────────────────────────────────
    const deleteNotification = useCallback(async (id: number) => {
        try {
            await adminNotificationApi.deleteNotification(id);
        } catch {
            // ignore
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // ── Auto-fetch on mount + poll every 60s ─────────────────────────
    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000);

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
