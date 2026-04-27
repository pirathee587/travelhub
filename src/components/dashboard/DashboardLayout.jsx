import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import {
  Bell,
  Search,
  Menu,
  X,
  CalendarCheck,
  CreditCard,
  Star,
  AlertTriangle,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const initialNotifications = [
  {
    id: 1,
    type: 'booking',
    title: 'New Booking Request',
    message: 'Sarah Johnson requested a Cultural Triangle tour for Apr 20–23.',
    time: '5 min ago',
    read: false,
    icon: CalendarCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Received',
    message: '$1,250 received from Michael Chen for Hill Country Adventure.',
    time: '28 min ago',
    read: false,
    icon: CreditCard,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    id: 3,
    type: 'review',
    title: 'New Customer Review',
    message: 'Emma Wilson left a 4-star review on Southern Coastal Bliss.',
    time: '1 hr ago',
    read: false,
    icon: Star,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    id: 4,
    type: 'cancellation',
    title: 'Booking Cancelled',
    message: 'Robert Taylor cancelled the Yala Safari trip (Apr 18).',
    time: '2 hrs ago',
    read: true,
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    id: 5,
    type: 'booking',
    title: 'Trip Completed',
    message: 'Colombo City Tour with David Brown marked as completed.',
    time: '3 hrs ago',
    read: true,
    icon: CheckCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export function DashboardLayout({
  children,
  title,
  subtitle,
  showSearch = true,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Header */}
        <header
          className={cn(
            'sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border px-4 transition-all duration-200 md:px-6',
            scrolled ? 'bg-background/95 backdrop-blur-sm' : 'bg-background'
          )}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground md:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden text-sm text-muted-foreground md:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="input-search w-64 rounded-full"
                />
              </div>
            )}

            {/* Notification Bell */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[380px] p-0 overflow-hidden"
                sideOffset={8}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No notifications
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-b-0',
                          !notification.read && 'bg-primary/[0.03]'
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5',
                            notification.bg
                          )}
                        >
                          <notification.icon
                            className={cn('h-4 w-4', notification.color)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                'text-sm leading-tight',
                                !notification.read
                                  ? 'font-semibold text-foreground'
                                  : 'font-medium text-foreground/80'
                              )}
                            >
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            >
                              <XCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] text-muted-foreground/70">
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/profile')}
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground shrink-0 transition-shadow group-hover:ring-2 group-hover:ring-primary/30">
                HK
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-primary transition-colors">Harith Keshan</p>
                <p className="text-xs text-muted-foreground leading-tight">Sri Lanka Travel Experts</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
