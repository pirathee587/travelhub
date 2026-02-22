import { Car, User, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: "available" | "booked" | "maintenance";
  driver?: string;
}

const vehicles: Vehicle[] = [
  { id: "V001", name: "Bajaj RE 4S", type: "Tuk-tuk", status: "available" },
  { id: "V002", name: "Mercedes V-Class", type: "Van", status: "booked", driver: "Pierre Martin" },
  { id: "V003", name: "Maruti Suzuki Wagon R", type: "Hatchback", status: "maintenance" },
  { id: "V004", name: "Toyota Alphard", type: "Van", status: "booked", driver: "Takeshi Yamamoto" },
];

const statusConfig = {
  available: { icon: CheckCircle, class: "badge-available", label: "Available" },
  booked: { icon: Clock, class: "badge-booked", label: "Booked" },
  maintenance: { icon: AlertTriangle, class: "badge-maintenance", label: "Maintenance" },
};

export function VehicleDriverQuickView() {
  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => {
        const status = statusConfig[vehicle.status];
        const StatusIcon = status.icon;
        return (
          <div
            key={vehicle.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{vehicle.name}</p>
                <p className="text-sm text-muted-foreground">{vehicle.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {vehicle.driver && (
                <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                  <User className="h-4 w-4" />
                  {vehicle.driver}
                </div>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  status.class
                )}
              >
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
