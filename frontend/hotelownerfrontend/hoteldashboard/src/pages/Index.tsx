import DashboardHeader from "@/components/DashboardHeader";
import RoomManagement from "@/components/RoomManagement";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import ReviewsList from "@/components/ReviewsList";
import LockedOverlay from "@/components/LockedOverlay";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Index = () => {
  const [roomSearch, setRoomSearch] = useState("");
  const { hotelId } = useParams<{ hotelId: string }>();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelStatus = async () => {
      if (!hotelId) return;
      try {
        const response = await fetch(`http://localhost:8080/api/v1/owner/hotels`);
        if (response.ok) {
          const hotels = await response.json();
          // Find this specific hotel in the list to get its status
          const currentHotel = hotels.find((h: any) => String(h.id) === String(hotelId));
          if (currentHotel) {
            setStatus(currentHotel.applicationStatus);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hotel status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelStatus();
  }, [hotelId]);

  const isPending = status === "Pending";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background pb-24 relative ${isPending ? "overflow-hidden" : ""}`}>
      {isPending && <LockedOverlay />}

      <div className={isPending ? "pointer-events-none" : ""}>
        <DashboardHeader roomSearch={roomSearch} onRoomSearchChange={setRoomSearch} />

        <main className="px-6 md:px-10 space-y-6">
          <RoomManagement searchQuery={roomSearch} hotelId={hotelId} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AmenitiesGrid hotelId={hotelId} />
            <ReviewsList hotelId={hotelId} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;