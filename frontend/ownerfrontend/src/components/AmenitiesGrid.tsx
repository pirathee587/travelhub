import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { AddAmenityDrawer } from "./AddAmenityDrawer";
import { EditAmenityDrawer } from "./EditAmenityDrawer";
import { resolveLucideIcon } from "@/lib/lucideIcon";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

const AmenitiesGrid = ({ hotelId, isLocked = false }: { hotelId?: string; isLocked?: boolean }) => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAmenities = async () => {
    if (!hotelId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/amenities/hotel/${hotelId}`
      );
      if (!res.ok) throw new Error("Failed to fetch amenities");
      const data = await res.json();
      // The backend AmenityController wraps the list in an ApiResponse object { success, message, data }
      const list = Array.isArray(data) ? data : (data.data || []);
      setAmenities(list);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Could not load amenities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [hotelId]);

  const handleDelete = async (amenityId: string) => {
    if (!window.confirm("Delete this amenity?")) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/amenities/${amenityId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Amenity removed");
        fetchAmenities();
      } else {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          toast.error(errData.message || "Failed to delete amenity");
        } catch {
          toast.error(text || "Failed to delete amenity");
        }
      }
    } catch {
      toast.error("Error deleting amenity");
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isLocked && amenities.length === 0) {
    return (
      <section className="rounded-xl bg-card shadow-md p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-base">Amenities Locked</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your hotel is under admin review. You cannot add or edit amenities until approval is complete.
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Typical review time: 24–48 hours. Changes will be enabled automatically after approval.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col rounded-xl bg-card shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-card-foreground">
          Amenities
        </h2>
        {!isLocked && hotelId && (
          <AddAmenityDrawer hotelId={hotelId} onSuccess={fetchAmenities}>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
              <Plus className="h-3 w-3" />
              Add
            </button>
          </AddAmenityDrawer>
        )}
      </div>

      {amenities.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No amenities yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add amenities to highlight your property features.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {amenities.map((a) => {
              const Icon = resolveLucideIcon(a.iconName);
              return (
                <div
                  key={a.id}
                  className="group relative flex items-center gap-3 rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 pr-14">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.description ?? ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 absolute right-3 bg-card pl-2">
                    {isLocked ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">
                        Locked
                      </span>
                    ) : (
                      <>
                        <EditAmenityDrawer
                          amenityId={a.id}
                          initialName={a.name}
                          initialDescription={a.description}
                          onSuccess={fetchAmenities}
                        >
                          <button
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit Amenity"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </EditAmenityDrawer>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Amenity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default AmenitiesGrid;
