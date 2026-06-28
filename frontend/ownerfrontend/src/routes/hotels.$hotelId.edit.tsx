import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { HotelForm, type HotelFormValues } from "@/components/HotelForm";
import { updateHotel, useHotel, type District } from "@/lib/hotels-store";

export const Route = createFileRoute("/hotels/$hotelId/edit")({
  head: () => ({
    meta: [{ title: "Edit Hotel — TravelHUB" }],
  }),
  component: EditHotelPage,
});

function EditHotelPage() {
  const { hotelId } = Route.useParams();
  const navigate = useNavigate();
  const { hotel, loading } = useHotel(hotelId);

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
          <h1 className="font-display text-2xl font-bold">Hotel not found</h1>
          <Link
            to="/"
            className="mt-5 inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleSubmit = async (values: HotelFormValues, files?: Record<string, File>) => {
    try {
      await updateHotel(hotelId, {
        ...values,
        district: values.district as District,
      }, files);
      toast.success("Hotel updated successfully.");
      navigate({ to: "/" });
    } catch (e) {
      toast.error("Failed to update hotel.");
    }
  };

  return (
    <AppShell>
      <HotelForm
        key={`edit-${hotel.id}`}
        mode="edit"
        initial={hotel}
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/" })}
      />
    </AppShell>
  );
}
