import { useState, useEffect } from 'react';
import { Car, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/utils';
import { api } from '@/features/agency/services/api';

const statusConfig = {
  available:   { icon: CheckCircle,   class: 'badge-available',   label: 'Available' },
  booked:      { icon: Clock,         class: 'badge-booked',      label: 'Booked' },
  maintenance: { icon: AlertTriangle, class: 'badge-maintenance', label: 'Maintenance' },
  'on-trip':   { icon: Clock,         class: 'badge-active',      label: 'On Trip' },
};

export function VehicleDriverQuickView() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await api.getVehicles();
        // Show only first 4 vehicles on dashboard
        setVehicles(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground text-sm py-4">Loading fleet...</p>;
  }

  if (vehicles.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No vehicles registered yet.</p>;
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => {
        const status = statusConfig[vehicle.status as keyof typeof statusConfig] || statusConfig['available'];
        const StatusIcon = status.icon;
        const vehicleName = vehicle.brand && vehicle.model
          ? `${vehicle.brand} ${vehicle.model}`
          : vehicle.registration || 'Vehicle';

        return (
          <div key={vehicle.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{vehicleName}</p>
                <p className="text-sm text-muted-foreground">{vehicle.vehicleType || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {vehicle.assignedDriverName && (
                <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                  <User className="h-4 w-4" />
                  {vehicle.assignedDriverName}
                </div>
              )}
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                status.class
              )}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
