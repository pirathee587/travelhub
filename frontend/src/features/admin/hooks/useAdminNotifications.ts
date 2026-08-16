import { useState, useEffect, useCallback } from 'react';
import adminNotificationApi from '../services/adminNotificationApi';

const READ_STORAGE_KEY = 'travelhub_admin_read_notifs';
const DELETED_STORAGE_KEY = 'travelhub_admin_deleted_notifs';

const getStoredIds = (key: string): number[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
};

const saveStoredIds = (key: string, ids: number[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(ids));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
};

export const useAdminNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── Fetch All Notifications ────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminNotificationApi.getAllNotifications();
            const storedReadIds = getStoredIds(READ_STORAGE_KEY);
            const storedDeletedIds = getStoredIds(DELETED_STORAGE_KEY);

            const rawList = Array.isArray(res) ? res : (res?.data || []);
            const list = rawList
                .filter((n: any) => !storedDeletedIds.includes(Number(n.id)))
                .map((n: any) => ({
                    ...n,
                    read: Boolean(n.read || storedReadIds.includes(Number(n.id)))
                }));

            setNotifications(list);
            setUnreadCount(list.filter((n: any) => !n.read).length);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch Unread Count ─────────────────────────
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await adminNotificationApi.getUnreadCount();
            const storedReadIds = getStoredIds(READ_STORAGE_KEY);
            const storedDeletedIds = getStoredIds(DELETED_STORAGE_KEY);

            if (storedReadIds.length > 0 || storedDeletedIds.length > 0) {
                const notifsRes = await adminNotificationApi.getAllNotifications();
                const rawList = Array.isArray(notifsRes) ? notifsRes : (notifsRes?.data || []);
                const unread = rawList.filter(
                    (n: any) => !storedDeletedIds.includes(Number(n.id)) && !n.read && !storedReadIds.includes(Number(n.id))
                );
                setUnreadCount(unread.length);
            } else {
                setUnreadCount(res?.count ?? 0);
            }
        } catch (err) {
            console.error('Count failed:', err);
        }
    }, []);

    // ── Mark One As Read ───────────────────────────
    const markAsRead = async (id: number | string) => {
        const numId = Number(id);
        try {
            await adminNotificationApi.markAsRead(numId);
        } catch (err) {
            console.error('Mark read failed:', err);
        }

        const storedReadIds = getStoredIds(READ_STORAGE_KEY);
        if (!storedReadIds.includes(numId)) {
            saveStoredIds(READ_STORAGE_KEY, [...storedReadIds, numId]);
        }

        setNotifications(prev =>
            prev.map(n =>
                Number(n.id) === numId ? { ...n, read: true } : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // ── Mark All As Read ───────────────────────────
    const markAllAsRead = async () => {
        try {
            await adminNotificationApi.markAllAsRead();
        } catch (err) {
            console.error('Mark all failed:', err);
        }

        const currentIds = notifications.map(n => Number(n.id));
        const storedReadIds = getStoredIds(READ_STORAGE_KEY);
        const combined = Array.from(new Set([...storedReadIds, ...currentIds]));
        saveStoredIds(READ_STORAGE_KEY, combined);

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    // ── Delete Notification ────────────────────────
    const deleteNotification = async (id: number | string) => {
        const numId = Number(id);
        try {
            await adminNotificationApi.deleteNotification(numId);
        } catch (err) {
            console.error('Delete failed:', err);
        }

        const storedDeletedIds = getStoredIds(DELETED_STORAGE_KEY);
        if (!storedDeletedIds.includes(numId)) {
            saveStoredIds(DELETED_STORAGE_KEY, [...storedDeletedIds, numId]);
        }

        const deleted = notifications.find(n => Number(n.id) === numId);
        setNotifications(prev => prev.filter(n => Number(n.id) !== numId));
        if (deleted && !deleted.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    // ── Auto fetch on mount ────────────────────────
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

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
