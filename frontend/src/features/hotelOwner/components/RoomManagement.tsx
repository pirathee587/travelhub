import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { AddRoomDrawer } from "./AddRoomDrawer";
import { EditRoomDrawer } from "./EditRoomDrawer";
import { toast } from "sonner";

interface Room {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  imageUrl?: string;
  image?: string;
}

type RoomManagementProps = {
  searchQuery: string;
  hotelId?: string;
  isLocked?: boolean;
};

const RoomManagement = ({ searchQuery, hotelId, isLocked = false }: RoomManagementProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    if (!hotelId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/rooms/hotel/${hotelId}`
      );
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Could not load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const handleDelete = async (roomId: string) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/v1/rooms/${roomId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Room deleted successfully");
        fetchRooms();
      } else {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          toast.error(errData.message || "Failed to delete room");
        } catch {
          toast.error(text || "Failed to delete room");
        }
      }
    } catch {
      toast.error("An error occurred while deleting");
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleRooms = q
    ? rooms.filter((r) => r.name.toLowerCase().includes(q))
    : rooms;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }


  return (
    <section className="flex flex-col rounded-xl bg-card shadow-md p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Room Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {visibleRooms.length} {visibleRooms.length === 1 ? "room" : "rooms"}
          </p>
        </div>
        {hotelId && (
          <AddRoomDrawer hotelId={hotelId} onSuccess={fetchRooms}>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
              Add Room
            </button>
          </AddRoomDrawer>
        )}
      </div>

      {visibleRooms.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No rooms yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add your first room to get started.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pr-1">
          <div className="grid gap-4">
            {visibleRooms.map((room) => {
              const imgSrc = room.imageUrl || room.image || "";
              return (
                <div
                  key={room.id}
                  className="group flex items-center gap-4 rounded-lg border border-border p-3 hover:shadow-md transition-all duration-200"
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={room.name}
                      className="h-16 w-24 rounded-md object-cover flex-shrink-0 bg-muted"
                    />
                  ) : (
                    <div className="h-16 w-24 rounded-md bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {room.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.type} · {room.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold text-card-foreground whitespace-nowrap">
                      ${room.price}
                      <span className="text-xs font-normal text-muted-foreground">
                        /night
                      </span>
                    </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditRoomDrawer
                          roomId={room.id}
                          initialName={room.name}
                          initialType={room.type}
                          initialPrice={room.price}
                          initialDescription={room.description}
                          onSuccess={fetchRooms}
                        >
                          <button
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Edit Room"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </EditRoomDrawer>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export default RoomManagement;
