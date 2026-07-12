import { Link, useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { AppShell } from "@/features/hotelOwner/components/AppShell";
import { HotelForm, type HotelFormValues } from "@/features/hotelOwner/components/HotelForm";
import { updateHotel, useHotel, type District } from "@/features/hotelOwner/services/hotels-store";

export default function EditHotelPage() {
  const { hotelId } = useParams();
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
            to="/hotelowner"
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
      navigate("/hotelowner");
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
        onCancel={() => navigate("/hotelowner")}
      />
    </AppShell>
  );
}
