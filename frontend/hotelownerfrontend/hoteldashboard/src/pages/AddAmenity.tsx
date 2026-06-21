import { ArrowLeft } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addAmenity } from "@/lib/amenitiesStore";
import { getLucideIconNames } from "@/lib/lucideIcon";
import { toast } from "@/hooks/use-toast";

const AddAmenity = () => {
    const navigate = useNavigate();
    const { hotelId } = useParams<{ hotelId: string }>();
    const backUrl = hotelId ? `/hotel/${hotelId}` : "/";
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [iconName, setIconName] = useState("");

    const iconOptions = useMemo(() => getLucideIconNames(), []);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast({ title: "Amenity name is required" });
            return;
        }

        addAmenity({
            name: trimmedName,
            description,
            iconName,
        });

        toast({ title: "Amenity added" });
        navigate(backUrl);
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-10">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link to={backUrl}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Add New Amenity</h1>
                </div>

                <form
                    className="space-y-6 bg-card p-6 rounded-lg border border-border shadow-sm"
                    onSubmit={onSubmit}
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Amenity Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Swimming Pool"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Short description of the amenity..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon Name (Lucide React)</Label>
                        <Input
                            id="icon"
                            placeholder="type any, e.g. wifi / Wifi / WAVES"
                            value={iconName}
                            onChange={(e) => setIconName(e.target.value)}
                            list="lucide-icon-names"
                        />
                        <datalist id="lucide-icon-names">
                            {iconOptions.map((n) => (
                                <option key={n} value={n} />
                            ))}
                        </datalist>
                        <p className="text-xs text-muted-foreground">
                            Case-insensitive. If the icon name doesn&apos;t exist in Lucide, a default icon will be shown.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link to={backUrl}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit">Add Amenity</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAmenity;
