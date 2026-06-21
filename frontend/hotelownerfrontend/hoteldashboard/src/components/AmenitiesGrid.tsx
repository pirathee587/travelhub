import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { resolveLucideIcon } from "@/lib/lucideIcon";
import { loadAmenities, type Amenity } from "@/lib/amenitiesStore";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const defaultAmenities: Array<Omit<Amenity, "id">> = [
  { iconName: "wifi", name: "Free Wi-Fi", description: "High-speed internet" },
  { iconName: "waves", name: "Infinity Pool", description: "Rooftop access" },
  { iconName: "dumbbell", name: "Fitness Center", description: "24/7 open" },
  { iconName: "sparkles", name: "Luxury Spa", description: "Full-service" },
  { iconName: "coffee", name: "Breakfast Included", description: "Buffet served daily" },
  { iconName: "car", name: "Free Parking", description: "On-site parking" },
  { iconName: "shower-head", name: "Hot Shower", description: "24/7 hot water" },
  { iconName: "air-vent", name: "Air Conditioning", description: "In-room climate control" },
  { iconName: "tv", name: "Smart TV", description: "Streaming enabled" },
  { iconName: "shield-check", name: "24/7 Security", description: "CCTV + staff" },
  { iconName: "clock", name: "Late Checkout", description: "Subject to availability" },
  { iconName: "map-pin", name: "City Center", description: "Prime location" },
  { iconName: "leaf", name: "Eco Friendly", description: "Sustainable practices" },
  { iconName: "random123", name: "Random Amenity", description: "Tests default icon fallback" },
];

  const AmenitiesGrid = ({ hotelId }: { hotelId?: string }) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    const stored = loadAmenities();
    const merged: Amenity[] = [
      ...stored,
      ...defaultAmenities.map((a, idx) => ({
        id: `default-${idx}`,
        name: a.name,
        description: a.description,
        iconName: a.iconName,
      })),
    ];
    setAmenities(merged);
  }, []);

  return (
    <section className="rounded-lg bg-card shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-card-foreground">Amenities</h2>
        <Link to="/add-amenity">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
            <Plus className="h-3 w-3" />
            Add
          </button>
        </Link>
      </div>
      <ScrollArea className="h-96 pr-3">
        <div className="grid grid-cols-2 gap-4">
          {amenities.map((a) => {
            const Icon = resolveLucideIcon(a.iconName);
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-border p-4 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.description ?? ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
};

export default AmenitiesGrid;
