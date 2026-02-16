import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { packages, TravelPackage } from "@/data/packages";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    MapPin,
    Clock,
    DollarSign,
    Calendar,
    CheckCircle,
    Edit,
    Save,
    X,
    Plus,
    Trash2,
    Upload,
    Image as ImageIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PackageDetails = () => {
    const { id } = useParams();
    const [pkg, setPkg] = useState<TravelPackage | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial data
    useEffect(() => {
        const foundPkg = packages.find((p) => p.id === id);
        if (foundPkg) {
            setPkg(JSON.parse(JSON.stringify(foundPkg))); // Deep copy
        }
    }, [id]);

    const handleSave = () => {
        // In a real app, this would send an API request to update the package.
        // Here we just toggle edit mode off, keeping the local state changes.
        setIsEditing(false);
        // Note: We are not persisting to the `packages` array in `data/packages.ts` 
        // because that file is read-only at runtime. Changes will persist only in 
        // this component's state until page reload.
    };

    const handleCancel = () => {
        // Revert changes
        const foundPkg = packages.find((p) => p.id === id);
        if (foundPkg) {
            setPkg(JSON.parse(JSON.stringify(foundPkg)));
        }
        setIsEditing(false);
    };

    // Field Updaters
    const updateField = (field: keyof TravelPackage, value: any) => {
        if (pkg) {
            setPkg({ ...pkg, [field]: value });
        }
    };

    const updateArrayField = (field: "includes" | "images", index: number, value: string) => {
        if (pkg && pkg[field]) {
            const newArray = [...(pkg[field] as string[])];
            newArray[index] = value; // Direct update if editable, but we might just replace whole array for includes
            // For includes, we'll parse a text block
        }
    };

    const handleIncludesChange = (text: string) => {
        if (pkg) {
            setPkg({ ...pkg, includes: text.split(",").map(i => i.trim()) });
        }
    };

    // Activity Management
    const addActivity = () => {
        if (pkg) {
            const activities = pkg.activities || [];
            setPkg({
                ...pkg,
                activities: [...activities, { day: activities.length + 1, title: "", description: "", image: "" }]
            });
        }
    };

    const removeActivity = (index: number) => {
        if (pkg && pkg.activities) {
            const newActivities = pkg.activities.filter((_, i) => i !== index);
            // Re-index days
            setPkg({
                ...pkg,
                activities: newActivities.map((a, i) => ({ ...a, day: i + 1 }))
            });
        }
    };

    const updateActivity = (index: number, field: string, value: string) => {
        if (pkg && pkg.activities) {
            const newActivities = [...pkg.activities];
            // @ts-ignore
            newActivities[index][field] = value;
            setPkg({ ...pkg, activities: newActivities });
        }
    };

    // Image Management
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && pkg) {
            const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
            setPkg({ ...pkg, images: [...(pkg.images || []), ...newImages] });
        }
    };

    const removeImage = (index: number) => {
        if (pkg && pkg.images) {
            setPkg({ ...pkg, images: pkg.images.filter((_, i) => i !== index) });
        }
    };

    const handleActivityImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && pkg && pkg.activities) {
            const imageUrl = URL.createObjectURL(file);
            const newActivities = [...pkg.activities];
            newActivities[index].image = imageUrl;
            setPkg({ ...pkg, activities: newActivities });
        }
    };

    const removeActivityImage = (index: number) => {
        if (pkg && pkg.activities) {
            const newActivities = [...pkg.activities];
            newActivities[index].image = "";
            setPkg({ ...pkg, activities: newActivities });
        }
    };

    if (!pkg) {
        return (
            <DashboardLayout title="Package Not Found" subtitle="Returns to packages list">
                <div className="flex flex-col items-center justify-center p-8">
                    <h2 className="text-2xl font-bold mb-4">Package not found</h2>
                    <Button asChild>
                        <Link to="/packages">Back to Packages</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={pkg.name} subtitle="Package Details">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link to="/packages">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-1" /> Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit Package
                            </Button>
                        )}
                    </div>
                </div>

                {/* Hero Image Section */}
                <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden bg-muted group">
                    {pkg.images && pkg.images.length > 0 ? (
                        <img
                            src={pkg.images[0]}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary via-primary to-accent/80 flex items-center justify-center text-primary-foreground/50 text-4xl font-bold">
                            {pkg.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}

                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" /> Change Cover Image
                            </Button>
                            {/* Hidden global file input for simplicity, though mapped to main images */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    )}

                    <div className="absolute top-4 right-4">
                        <Badge variant={pkg.available ? "default" : "destructive"} className="text-sm">
                            {pkg.available ? "Available" : "Unavailable"}
                        </Badge>
                    </div>
                </div>

                {/* Gallery Management in Edit Mode */}
                {isEditing && (
                    <div className="space-y-2">
                        <Label>Gallery Images</Label>
                        <div className="grid grid-cols-4 gap-4">
                            {pkg.images?.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-md overflow-hidden bg-muted border group/img">
                                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <div
                                className="aspect-video rounded-md border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Plus className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Add Image</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        <div>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Package Name</Label>
                                        <Input
                                            value={pkg.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            className="text-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Destination</Label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={pkg.destination}
                                                onChange={(e) => updateField("destination", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold">{pkg.name}</h2>
                                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                        <MapPin className="h-5 w-5" />
                                        <span className="text-lg">{pkg.destination}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-card">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</p>
                                {isEditing ? (
                                    <Input value={pkg.duration} onChange={(e) => updateField("duration", e.target.value)} className="h-8" />
                                ) : (
                                    <p className="font-semibold">{pkg.duration}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Price</p>
                                {isEditing ? (
                                    <Input type="number" value={pkg.price} onChange={(e) => updateField("price", Number(e.target.value))} className="h-8" />
                                ) : (
                                    <p className="font-semibold">${pkg.price.toLocaleString()}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Bookings</p>
                                <p className="font-semibold">{pkg.bookings}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            {isEditing ? (
                                <Textarea
                                    value={pkg.description}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    rows={5}
                                />
                            ) : (
                                <p className="text-muted-foreground leading-relaxed">
                                    {pkg.description}
                                </p>
                            )}
                        </div>

                        {/* Activities Timeline */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Itinerary</h3>
                                {isEditing && (
                                    <Button size="sm" variant="outline" onClick={addActivity}>
                                        <Plus className="h-3 w-3 mr-1" /> Add Day
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6 pl-4 border-l-2 border-muted relative">
                                {pkg.activities?.map((activity, idx) => (
                                    <div key={idx} className="relative pl-6 pb-2 group/activity">
                                        <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />

                                        {isEditing ? (
                                            <div className="space-y-3 p-4 border rounded-lg bg-muted/20 relative">
                                                <button
                                                    onClick={() => removeActivity(idx)}
                                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div className="col-span-1">
                                                        <Label className="text-xs">Day</Label>
                                                        <Input
                                                            type="number"
                                                            value={activity.day}
                                                            disabled
                                                            className="bg-muted"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <Label className="text-xs">Title</Label>
                                                        <Input
                                                            value={activity.title}
                                                            onChange={(e) => updateActivity(idx, "title", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Description</Label>
                                                    <Textarea
                                                        value={activity.description}
                                                        onChange={(e) => updateActivity(idx, "description", e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs mb-1 block">Image</Label>
                                                    {activity.image ? (
                                                        <div className="relative aspect-video w-32 rounded-md overflow-hidden bg-muted border">
                                                            <img src={activity.image} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeActivityImage(idx)}
                                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-destructive hover:text-white"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative border border-dashed border-input rounded-md p-2 hover:bg-muted/50 cursor-pointer w-full text-center">
                                                            <input
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                accept="image/*"
                                                                onChange={(e) => handleActivityImageUpload(idx, e)}
                                                            />
                                                            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                                                <Plus className="h-3 w-3" /> Add Image
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <span className="text-sm font-bold text-primary px-2 py-0.5 rounded bg-primary/10 w-fit">Day {activity.day}</span>
                                                    <h4 className="font-semibold">{activity.title}</h4>
                                                </div>
                                                <p className="text-muted-foreground text-sm">{activity.description}</p>
                                                {activity.image && (
                                                    <div className="rounded-lg overflow-hidden h-40 w-full sm:w-64 bg-muted mt-2 border">
                                                        <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gallery View (Read-only mode) */}
                        {!isEditing && pkg.images && pkg.images.length > 1 && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {pkg.images.slice(1).map((img, i) => (
                                        <div key={i} className="aspect-video rounded-lg overflow-hidden border bg-muted">
                                            <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 border rounded-xl bg-card shadow-sm space-y-4">
                            <h3 className="font-semibold text-xl">What's Included</h3>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Textarea
                                        value={pkg.includes.join(", ")}
                                        onChange={(e) => handleIncludesChange(e.target.value)}
                                        placeholder="Comma separated list..."
                                        rows={6}
                                    />
                                    <p className="text-xs text-muted-foreground">Separate items with commas</p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {pkg.includes.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* "Book This Package" button removed as requested */}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PackageDetails;
