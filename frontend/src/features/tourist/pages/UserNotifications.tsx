import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '@/services/notificationService';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Input } from '@/components/common/ui/input';
import { Bell, CreditCard, Loader2, CheckCircle2, ArrowLeft, Search, X, ArrowUpDown, RotateCcw } from 'lucide-react';
import { cn, RenderDateTime } from '@/features/tourist/services/utils';
import { DashboardLayout } from '@/features/tourist/components/dashboard/DashboardLayout';
import { DocumentListSkeleton } from '@/components/common/ui/skeletons';
import { useAuth } from '@/context/AuthContext';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('travelhub_token')
      || localStorage.getItem('token')
      || sessionStorage.getItem('travelhub_token')
      || sessionStorage.getItem('token');
    if (user && token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('travelhub_token')
      || localStorage.getItem('token')
      || sessionStorage.getItem('travelhub_token')
      || sessionStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error: any) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (notification: any) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
      } catch (e) {
        console.error('Failed to mark notification read:', e);
      }
    }

    const actionUrl = notification.actionUrl || notification.link || notification.url;
    if (actionUrl && typeof actionUrl === 'string') {
      let targetUrl = actionUrl;
      if (targetUrl.startsWith('/payment/')) {
        targetUrl = `/tourist${targetUrl}`;
      } else if (!targetUrl.startsWith('/tourist') && targetUrl.startsWith('/')) {
        targetUrl = `/tourist${targetUrl}`;
      }
      navigate(targetUrl);
      return;
    }

    // Fallback navigation based on notification content/type
    const type = (notification.type || '').toLowerCase();
    const title = (notification.title || '').toLowerCase();
    const message = (notification.message || '').toLowerCase();

    if (
      type.includes('payment') || type.includes('billing') || type.includes('refund') || type.includes('payout') ||
      title.includes('payment') || title.includes('billing') || title.includes('refund') || title.includes('payout') ||
      message.includes('payment') || message.includes('refund')
    ) {
      navigate('/tourist/billing');
    } else if (
      type.includes('account') || type.includes('profile') || type.includes('setting') ||
      title.includes('account') || title.includes('profile') || title.includes('setting')
    ) {
      navigate('/tourist/settings');
    } else {
      navigate('/tourist/trips');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setReadFilter('all');
  };

  const filteredAndSortedNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        // Read Filter
        if (readFilter === 'unread' && n.read) return false;
        if (readFilter === 'read' && !n.read) return false;

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const title = (n.title || '').toLowerCase();
          const message = (n.message || '').toLowerCase();
          const type = (n.type || '').toLowerCase();
          return title.includes(q) || message.includes(q) || type.includes(q);
        }

        return true;
      });
  }, [notifications, readFilter, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== '' || readFilter !== 'all';

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto pb-10 animate-slide-up mt-16 md:mt-0">
        <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground -ml-4" onClick={() => navigate('/tourist/settings')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground mt-1">Stay updated on bookings, payments, and account activity.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="gap-2" onClick={handleMarkAllRead}>
              <CheckCircle2 className="w-4 h-4" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {!loading && notifications.length > 0 && (
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Unread / Read Filter Buttons */}
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
                <button
                  onClick={() => setReadFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    readFilter === 'all' ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setReadFilter('unread')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    readFilter === 'unread' ? "bg-background text-primary shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Unread
                </button>
                <button
                  onClick={() => setReadFilter('read')}
                  className={cn(
                    "px-3 py-1.5 rounded-md font-medium transition-all",
                    readFilter === 'read' ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Read
                </button>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <DocumentListSkeleton count={4} />
        ) : notifications.length === 0 ? (
          <Card className="border-dashed border-2 shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h5 className="text-xl font-semibold mb-2">No notifications yet</h5>
              <p className="text-muted-foreground">We will notify you about bookings, payments, and account updates.</p>
            </CardContent>
          </Card>
        ) : filteredAndSortedNotifications.length === 0 ? (
          <Card className="border-dashed border-2 shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h5 className="text-lg font-semibold mb-2">No matching notifications</h5>
              <p className="text-muted-foreground mb-6 max-w-sm">We couldn't find any notifications matching your search or filter criteria.</p>
              <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <div className="divide-y">
              {filteredAndSortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleOpen(notification)}
                  className={cn(
                    "p-5 flex justify-between items-start gap-4 cursor-pointer transition-colors hover:bg-secondary/50",
                    !notification.read ? "bg-primary/5" : "bg-card"
                  )}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                        {notification.type}
                      </Badge>
                      {!notification.read && <Badge className="bg-primary hover:bg-primary">New</Badge>}
                      {(notification.createdAt || notification.date || notification.timestamp) && (
                        <RenderDateTime
                          dateTimeStr={notification.createdAt || notification.date || notification.timestamp}
                          className="text-xs text-muted-foreground ml-auto"
                        />
                      )}
                    </div>
                    <h6 className="font-semibold">{notification.title}</h6>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserNotifications;
