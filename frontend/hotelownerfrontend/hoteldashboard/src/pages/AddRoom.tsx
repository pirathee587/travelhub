import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const roomTypeOptions = ["Single", "Double", "Suite", "Penthouse", "Deluxe"];

  const AddRoom = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const backUrl = hotelId ? `/hotel/${hotelId}` : "/";
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to={backUrl}>
          <Button variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
          </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Room</h1>
        </div>

        <form className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input id="name" placeholder="e.g. Deluxe Ocean Suite" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Room Type</Label>
              <Input
                id="type"
                placeholder="e.g. Deluxe"
                list="room-type-options"
                autoComplete="off"
              />
              <datalist id="room-type-options">
                {roomTypeOptions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Select an existing type or type a new one.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Night ($)</Label>
              <Input id="price" type="number" placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the room features and view..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Room Image</Label>
            <Input id="image" type="file" accept="image/*" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link to={backUrl}>
            <Button variant="outline" type="button">
            Cancel
            </Button>
            </Link>
            <Button type="submit">Add Room</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
