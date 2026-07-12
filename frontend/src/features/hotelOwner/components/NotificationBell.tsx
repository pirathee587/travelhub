import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Trash2, Hotel, XCircle, Lock } from "lucide-react";
import { getOwnerAuthHeaders } from "@/features/hotelOwner/services/owner-auth-headers";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://localhost:8080/api/v1/owner/notifications";

type OwnerNotification = {
  id: number;
  hotelId: number | null;
  type: "APPROVED" | "REJECTED" | "SUSPENDED";
  title: string;
  message: string;
  time: string;
  read: boolean;
};

function typeConfig(type: OwnerNotification["type"]) {
  switch (type) {
    case "APPROVED":
      return {
        icon: <Hotel className="h-4 w-4" />,
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Approved",
      };
    case "REJECTED":
      return {
        icon: <XCircle className="h-4 w-4" />,
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-700 border-red-200",
        label: "Rejected",
      };
    case "SUSPENDED":
      return {
        icon: <Lock className="h-4 w-4" />,
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Suspended",
      };
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(API_BASE, { headers: getOwnerAuthHeaders() });
      if (!res.ok) return;
      const data: OwnerNotification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/${id}/read`, {
        method: "PATCH",
        headers: getOwnerAuthHeaders(),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/read-all`, {
        method: "PATCH",
        headers: getOwnerAuthHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const deleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: getOwnerAuthHeaders(),
      });
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter((n) => !n.read).length);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-button"
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:shadow-md hover:text-foreground transition"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute right-0 top-11 z-50 w-[360px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="inline-flex h-5 items-center rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[340px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground">
                    Hotel approval, rejection and suspension notifications will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`group flex cursor-pointer gap-3 border-b border-border/50 px-4 py-3 transition hover:bg-muted/40 ${
                        !n.read ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      {/* Icon + unread dot */}
                      <div className="relative mt-0.5 flex-shrink-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${cfg.badge}`}>
                          {cfg.icon}
                        </div>
                        {!n.read && (
                          <span className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${cfg.dot} ring-2 ring-card`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                            {n.title}
                          </p>
                          <button
                            onClick={(e) => deleteNotification(n.id, e)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition p-0.5 rounded"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {n.message && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-muted-foreground/70">{n.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 text-center">
                <p className="text-xs text-muted-foreground">
                  Showing {notifications.length} hotel notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
