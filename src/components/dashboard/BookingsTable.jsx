import { MapPin, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const mockBookings = [
  {
    id: 'BK001',
    customerName: 'Sarah Johnson',
    destination: 'Sigiriya, Dambulla',
    travelDates: 'Jan 15 - Jan 22',
    packageType: 'Cultural Triangle Heritage',
    vehicle: 'Bajaj RE 4S',
    driver: 'Nimal Perera',
    status: 'active',
  },
  {
    id: 'BK002',
    customerName: 'Michael Chen',
    destination: 'Ella, Badulla',
    travelDates: 'Jan 18 - Jan 25',
    packageType: 'Hill Country Train Adventure',
    vehicle: 'Mercedes V-Class',
    driver: 'Kavindu Jayasinghe',
    status: 'pending',
  },
  {
    id: 'BK003',
    customerName: 'Emma Wilson',
    destination: 'Mirissa, Matara',
    travelDates: 'Jan 10 - Jan 17',
    packageType: 'Southern Coastal Bliss',
    vehicle: 'Toyota Alphard',
    driver: 'Tharushi Fernando',
    status: 'completed',
  },
  {
    id: 'BK004',
    customerName: 'James Brown',
    destination: 'Yala National Park',
    travelDates: 'Jan 20 - Jan 27',
    packageType: 'Wild Yala Safari',
    vehicle: 'Maruti Suzuki Wagon R',
    driver: 'Saman Kumara',
    status: 'pending',
  },
  {
    id: 'BK005',
    customerName: 'Lisa Anderson',
    destination: 'Galle Fort, Galle',
    travelDates: 'Jan 05 - Jan 12',
    packageType: 'Southern Coastal Bliss',
    vehicle: 'Toyota Alphard',
    driver: 'Tharushi Fernando',
    status: 'cancelled',
  },
];

const statusBadge = {
  pending: 'badge-pending',
  active: 'badge-active',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
};

export function BookingsTable() {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dates
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Package
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockBookings.map((booking) => (
              <tr key={booking.id} className="table-row-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {booking.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {booking.destination}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {booking.travelDates}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-foreground">{booking.packageType}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                      statusBadge[booking.status]
                    )}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
