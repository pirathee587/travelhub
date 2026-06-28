import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import DashboardHeader from "@/components/DashboardHeader";
import RoomManagement from "@/components/RoomManagement";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import ReviewsList from "@/components/ReviewsList";
import LockedOverlay from "@/components/LockedOverlay";
import { useHotel } from "@/lib/hotels-store";

export const Route = createFileRoute("/dashboard/$hotelId")({
  head: () => ({
    meta: [{ title: "Hotel Dashboard — TravelHUB" }],
  }),
  component: HotelDashboardPage,
});

function HotelDashboardPage() {
  const { hotelId } = Route.useParams();
  const [roomSearch, setRoomSearch] = useState("");
  const { hotel, loading } = useHotel(hotelId);

  const isPending = hotel?.applicationStatus === "Pending";
  const isSuspended = hotel?.applicationStatus === "Approved" && hotel?.isActive === false;
  const isLocked = isPending || isSuspended;

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!hotel) {
    return (
      <AppShell>
        <div className="rounded-2xl bg-card p-10 text-center shadow-md">
          <h1 className="text-2xl font-bold text-foreground">
            Hotel not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This hotel may not belong to your account.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Full-page lock when Pending or Suspended */}
      <div className={`relative h-[calc(100vh-180px)] flex flex-col ${isLocked ? "overflow-hidden" : ""}`}>
        {isLocked && <LockedOverlay reason={isSuspended ? "suspended" : "pending"} />}

        {/* Content — pointer-events disabled when pending or suspended */}
        <div className={`flex flex-col flex-1 min-h-0 ${isLocked ? "pointer-events-none select-none" : ""}`}>
          <DashboardHeader
            roomSearch={roomSearch}
            onRoomSearchChange={setRoomSearch}
            hotelName={hotel.hotelName}
          />

          <div className="mt-6 flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <RoomManagement searchQuery={roomSearch} hotelId={hotelId} isLocked={isLocked} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 flex-1 min-h-0">
              <AmenitiesGrid hotelId={hotelId} isLocked={isLocked} />
              <ReviewsList hotelId={hotelId} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
