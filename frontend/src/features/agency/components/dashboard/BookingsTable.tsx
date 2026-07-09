import { useState, useEffect } from 'react';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/common/ui/button';
import { cn } from '@/utils/utils';
import { useNavigate } from 'react-router-dom';
import { api } from '@/features/agency/services/api';

const statusBadge = {
  pending:   'badge-pending',
  active:    'badge-active',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

export function BookingsTable() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getBookings();
        // Show only the 5 most recent bookings on dashboard
        setBookings(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground text-sm px-4 py-6">Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-muted-foreground text-sm px-4 py-6">No bookings yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destination</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dates</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Package</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.map((booking) => {
              const initials = booking.bookingId
                ? booking.bookingId.slice(-2).toUpperCase()
                : 'BK';
              return (
                <tr key={booking.id} className="table-row-hover">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{booking.packageName || 'Package'}</p>
                        <p className="text-sm text-muted-foreground">{booking.bookingId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {booking.destination || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {booking.startDate} {booking.endDate ? `- ${booking.endDate}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground">{booking.packageName || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                      statusBadge[booking.status] || 'badge-pending'
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm" className="gap-1"
                      onClick={() => navigate(`/agency/bookings/${booking.id}`)}>
                      <Eye className="h-4 w-4" />View Details
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
