import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { HotelForm } from "@/components/HotelForm";
import { getEmailFromToken } from "@/lib/auth-utils";

export const Route = createFileRoute("/hotels/new")({
  head: () => ({
    meta: [
      { title: "Add a Hotel — TravelHUB" },
      { name: "description", content: "Add a new property to your portfolio." },
    ],
  }),
  component: AddHotelPage,
});

function AddHotelPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <HotelForm
        key="create"
        mode="create"
        onCancel={() => navigate({ to: "/" })}
        onSubmit={async (values, files) => {
          const formData = new FormData();
          formData.append("hotelName", values.name);
          formData.append("destination", values.destination);
          formData.append("location", values.address);
          formData.append("district", values.district);
          
          // The backend DTO 'ownerEmail' field is used for the hotel's contact email.
          // The actual property ownership is handled by the backend using the principal.
          formData.append("ownerEmail", values.email);
          
          formData.append("phoneNumber", values.phone);
          // The form no longer collects prices, so we send default values or omit them.
          formData.append("priceFrom", "0");
          formData.append("description", values.description);

          // Get the cover image file (first in the images array)
          const coverImageSrc = values.images[0];
          const coverFile = files?.[coverImageSrc];
          if (coverFile) {
            formData.append("hotelImage", coverFile);
          }

          const token = localStorage.getItem("token");
          const headers: HeadersInit = token
            ? { Authorization: `Bearer ${token}` }
            : {};

          const promise = fetch("http://localhost:8080/api/v1/owner/hotels", {
            method: "POST",
            headers,
            body: formData,
          }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to add hotel");
            return await res.json();
          });

          toast.promise(promise, {
            loading: "Adding hotel...",
            success: (data) => {
              sessionStorage.setItem("travelhub:lastHotelFilterStatus", "Pending");
              navigate({ to: "/" });
              return `${values.name} has been added successfully.`;
            },
            error: "Failed to add hotel. Please try again.",
          });
        }}
      />
    </AppShell>
  );
}