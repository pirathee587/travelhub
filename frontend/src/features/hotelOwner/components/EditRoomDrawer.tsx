import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/common/ui/drawer";
import { toast } from "sonner";

const roomTypeOptions = ["Single", "Double", "Suite", "Penthouse", "Deluxe"];

interface EditRoomDrawerProps {
  roomId: string;
  initialName: string;
  initialType: string;
  initialPrice: number;
  initialDescription: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function EditRoomDrawer({
  roomId,
  initialName,
  initialType,
  initialPrice,
  initialDescription,
  onSuccess,
  children,
}: EditRoomDrawerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialName,
    type: initialType,
    price: initialPrice.toString(),
    description: initialDescription,
  });
  const [image, setImage] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.price) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", formData.type);
      data.append("price", formData.price);
      data.append("description", formData.description);
      if (image) {
        data.append("image", image);
      }

      const res = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      if (res.ok) {
        toast.success("Room updated successfully!");
        setOpen(false);
        setImage(null);
        onSuccess();
      } else {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          toast.error(errData.message || "Failed to update room");
        } catch {
          toast.error(text || "Failed to update room");
        }
      }
    } catch (error) {
      console.error("Error updating room:", error);
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
          setFormData({
            name: initialName,
            type: initialType,
            price: initialPrice.toString(),
            description: initialDescription || "",
          });
          setImage(null);
        }
      }}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="hotel-owner-theme max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Edit Room</DrawerTitle>
          <DrawerDescription>Update the details of your room.</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <form onSubmit={onSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${roomId}`} className="text-sm font-semibold">
                Room Name
              </Label>
              <Input
                id={`name-${roomId}`}
                placeholder="e.g. Deluxe Ocean Suite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl bg-muted/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`type-${roomId}`} className="text-sm font-semibold">
                  Room Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="rounded-xl bg-muted/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`price-${roomId}`} className="text-sm font-semibold">
                  Price per Night ($)
                </Label>
                <Input
                  id={`price-${roomId}`}
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="rounded-xl bg-muted/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${roomId}`} className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id={`description-${roomId}`}
                placeholder="Describe the room features and view..."
                className="min-h-[100px] rounded-xl bg-muted/50 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`image-${roomId}`} className="text-sm font-semibold">
                Room Image (optional to change)
              </Label>
              <Input
                id={`image-${roomId}`}
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="rounded-xl bg-muted/50 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-border mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
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
