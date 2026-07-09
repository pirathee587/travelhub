import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '@/services/notificationService';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/common/ui/card';
import { Button } from '@/components/common/ui/button';
import { Badge } from '@/components/common/ui/badge';
import { Bell, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/features/tourist/services/utils';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (notification: any) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      // Map action url from legacy /payment to /tourist/payment
      let targetUrl = notification.actionUrl;
      if (targetUrl.startsWith('/payment/')) {
        targetUrl = `/tourist${targetUrl}`;
      }
      navigate(targetUrl);
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

  return (
    <div className="container max-w-4xl py-8 mx-auto animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">Stay updated on bookings, payments, and account activity.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link to="/tourist/billing">
              <CreditCard className="w-4 h-4" />
              Billing
            </Link>
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-4 h-4" />
            Mark all read
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
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
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <div className="divide-y">
            {notifications.map((notification) => (
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
                  </div>
                  <h6 className="font-semibold">{notification.title}</h6>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {notification.time}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserNotifications;
