import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import DashboardHeader from "@/components/DashboardHeader";
import RoomManagement from "@/components/RoomManagement";
import AmenitiesGrid from "@/components/AmenitiesGrid";
import ReviewsList from "@/components/ReviewsList";
import LockedOverlay from "@/components/LockedOverlay";
import { getEmailFromToken } from "@/lib/auth-utils";

export const Route = createFileRoute("/dashboard/$hotelId")({
  head: () => ({
    meta: [{ title: "Hotel Dashboard — TravelHUB" }],
  }),
  component: HotelDashboardPage,
});

interface HotelInfo {
  id: string;
  hotelName: string;
  applicationStatus: string;
}

function HotelDashboardPage() {
  const { hotelId } = Route.useParams();
  const [roomSearch, setRoomSearch] = useState("");
  const [hotel, setHotel] = useState<HotelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelStatus = async () => {
      if (!hotelId) return;
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const fetchByStatus = async (status: string) => {
          const res = await fetch(
            `http://localhost:8080/api/v1/owner/hotels?status=${status}`,
            { headers }
          );
          if (!res.ok) return [];
          return (await res.json()) as HotelInfo[];
        };

        const results = await Promise.all([
          fetchByStatus("Pending"),
          fetchByStatus("Approved"),
          fetchByStatus("Rejected")
        ]);

        const allHotels = results.flat();
        const found = allHotels.find((h) => String(h.id) === String(hotelId));

        setHotel(found ?? null);
      } catch (error) {
        console.error("Failed to fetch hotel status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelStatus();
  }, [hotelId]);

  const isPending = hotel?.applicationStatus === "Pending";

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
      {/* Full-page lock when Pending */}
      <div className={`relative h-[calc(100vh-180px)] flex flex-col ${isPending ? "overflow-hidden" : ""}`}>
        {isPending && <LockedOverlay />}

        {/* Content — pointer-events disabled when pending */}
        <div className={`flex flex-col flex-1 min-h-0 ${isPending ? "pointer-events-none select-none" : ""}`}>
          <DashboardHeader
            roomSearch={roomSearch}
            onRoomSearchChange={setRoomSearch}
            hotelName={hotel.hotelName}
          />

          <div className="mt-6 flex flex-col gap-6 flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <RoomManagement searchQuery={roomSearch} hotelId={hotelId} isLocked={isPending} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 flex-1 min-h-0">
              <AmenitiesGrid hotelId={hotelId} isLocked={isPending} />
              <ReviewsList hotelId={hotelId} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
