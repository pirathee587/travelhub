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

interface EditAmenityDrawerProps {
  amenityId: string;
  initialName: string;
  initialDescription: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditAmenityDrawer({
  amenityId,
  initialName,
  initialDescription,
  onSuccess,
  children,
}: EditAmenityDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    description: initialDescription,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Amenity name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/amenities/${amenityId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
        }),
      });

      if (res.ok) {
        toast.success("Amenity updated successfully!");
        setOpen(false);
        onSuccess();
      } else {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          toast.error(errData.message || "Failed to update amenity");
        } catch {
          toast.error(text || "Failed to update amenity");
        }
      }
    } catch (error) {
      console.error("Error updating amenity:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) {
          setFormData({ name: initialName, description: initialDescription || "" });
        }
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Edit Amenity</DrawerTitle>
          <DrawerDescription>Update the details of your property's amenity.</DrawerDescription>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
