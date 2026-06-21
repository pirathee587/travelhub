import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import hotelRoom1 from "@/assets/hotel-room-1.jpg";
import hotelRoom2 from "@/assets/hotel-room-2.jpg";
import hotelRoom3 from "@/assets/hotel-room-3.jpg";

interface Room {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  image: string;
}

const rooms: Room[] = [
  { id: 1, name: "Deluxe Suite", description: "Spacious suite with premium amenities.", type: "Suite", price: 320, image: hotelRoom1 },
  { id: 2, name: "Standard King", description: "Comfortable king room for a relaxing stay.", type: "King", price: 180, image: hotelRoom2 },
  { id: 3, name: "Executive Suite", description: "Elegant suite with a work area and lounge.", type: "Suite", price: 450, image: hotelRoom3 },
  { id: 4, name: "Ocean View Twin", description: "Twin beds with a beautiful ocean view.", type: "Twin", price: 220, image: hotelRoom1 },
  { id: 5, name: "Garden Family Room", description: "Two queen beds, ideal for families.", type: "Family", price: 275, image: hotelRoom2 },
  { id: 6, name: "Penthouse Skyline", description: "Top floor with panoramic city views.", type: "Penthouse", price: 620, image: hotelRoom3 },
  { id: 7, name: "Classic Double", description: "Cozy double room near the lobby.", type: "Double", price: 145, image: hotelRoom1 },
  { id: 8, name: "Accessible Queen", description: "Ground floor with accessible bathroom.", type: "Accessible", price: 195, image: hotelRoom2 },
  { id: 9, name: "Studio Loft", description: "Open-plan with kitchenette.", type: "Studio", price: 240, image: hotelRoom3 },
  { id: 10, name: "Honeymoon Junior Suite", description: "Romantic nook with soaking tub.", type: "Deluxe", price: 380, image: hotelRoom1 },
];

type RoomManagementProps = {
  searchQuery: string;
  hotelId?: string;
};

const RoomManagement = ({ searchQuery, hotelId }: RoomManagementProps) => {
  const q = searchQuery.trim().toLowerCase();
  const visibleRooms = q ? rooms.filter((r) => r.name.toLowerCase().includes(q)) : rooms;

  return (
    <section className="rounded-lg bg-card shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Room Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {visibleRooms.length} rooms
          </p>
        </div>
        <Link to={hotelId ? `/hotel/${hotelId}/add-room` : "/add-room"}>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-navy-light transition-colors">
        <Plus className="h-4 w-4" />
        Add Room
        </button>
        </Link>
        </div>

      <div className="h-96 min-h-0 overflow-y-auto overscroll-y-contain pr-1">
        <div className="grid gap-4">
          {visibleRooms.map((room) => (
            <div
              key={room.id}
              className="group flex items-center gap-4 rounded-lg border border-border p-3 hover:shadow-card-hover transition-all duration-200"
            >
              <img
                src={room.image}
                alt={room.name}
                className="h-16 w-24 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">{room.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {room.type} · {room.description}
                </p>
              </div>
              <p className="text-sm font-bold text-card-foreground whitespace-nowrap">
                ${room.price}<span className="text-xs font-normal text-muted-foreground">/night</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomManagement;
