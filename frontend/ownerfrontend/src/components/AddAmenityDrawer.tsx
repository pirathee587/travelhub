import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

interface AddAmenityDrawerProps {
  hotelId: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function AddAmenityDrawer({ hotelId, onSuccess, children }: AddAmenityDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Amenity name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/v1/amenities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          hotelId: Number(hotelId),
        }),
      });

      if (res.ok) {
        toast.success("Amenity added successfully!");
        setOpen(false);
        setFormData({ name: "", description: "" });
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add amenity");
      }
    } catch (error) {
      console.error("Error adding amenity:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Add New Amenity</DrawerTitle>
          <DrawerDescription>
            List a new amenity to highlight your property features.
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <form onSubmit={onSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amenityName" className="text-sm font-semibold">
                Amenity Name
              </Label>
              <Input
                id="amenityName"
                placeholder="e.g. Swimming Pool"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="rounded-xl bg-muted/50 border-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenityDescription" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="amenityDescription"
                placeholder="Short description of the amenity..."
                className="min-h-[150px] rounded-xl bg-muted/50 border-none resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1e293b] hover:bg-[#0f172a] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Save Amenity"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
