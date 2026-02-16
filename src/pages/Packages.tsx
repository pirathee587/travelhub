import { useState, useRef } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { Link } from "react-router-dom";
import { packages, TravelPackage } from "@/data/packages";

const Packages = () => {
  const [search, setSearch] = useState("");
  const [packagesList, setPackagesList] = useState(packages);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    duration: "",
    price: "",
    description: "",
    includes: "",
  });

  const [activities, setActivities] = useState<{ day: number; title: string; description: string; image?: string }[]>([
    { day: 1, title: "", description: "", image: "" },
  ]);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addActivity = () => {
    setActivities([...activities, { day: activities.length + 1, title: "", description: "", image: "" }]);
  };

  const removeActivity = (index: number) => {
    const newActivities = activities.filter((_, i) => i !== index);
    // Re-index days
    setActivities(newActivities.map((a, i) => ({ ...a, day: i + 1 })));
  };

  const updateActivity = (index: number, field: "title" | "description", value: string) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const handleActivityImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newActivities = [...activities];
      newActivities[index].image = imageUrl;
      setActivities(newActivities);
    }
  };

  const removeActivityImage = (index: number) => {
    const newActivities = [...activities];
    newActivities[index].image = "";
    setActivities(newActivities);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const filteredPackages = packagesList.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      destination: "",
      duration: "",
      price: "",
      description: "",
      includes: "",
    });
    setActivities([{ day: 1, title: "", description: "", image: "" }]);
    setImages([]);
    setEditingPackage(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (pkg: TravelPackage) => {
    setFormData({
      name: pkg.name,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price.toString(),
      description: pkg.description,
      includes: pkg.includes.join(", "),
    });
    // For this mock, we don't have activities/images in the data model yet properly mapped, 
    // so we'll mock them or keep them empty if not present. 
    // Assuming the data structure update wasn't part of this specific request, 
    // we will just load what we can.
    setActivities([{ day: 1, title: "Day 1", description: "Activity details...", image: "" }]);
    setImages(pkg.images?.length ? pkg.images : []);
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const handleSavePackage = () => {
    if (editingPackage) {
      // Update existing
      setPackagesList((prev) =>
        prev.map((pkg) =>
          pkg.id === editingPackage.id
            ? {
              ...pkg,
              name: formData.name,
              destination: formData.destination,
              duration: formData.duration,
              price: parseFloat(formData.price) || 0,
              description: formData.description,
              includes: formData.includes.split(",").map((s) => s.trim()).filter(Boolean),
              images: images.length > 0 ? images : (pkg.images || []),
            }
            : pkg
        )
      );
    } else {
      // Create new
      const newPackage: TravelPackage = {
        id: `P${String(packagesList.length + 1).padStart(3, "0")}`,
        name: formData.name,
        destination: formData.destination,
        duration: formData.duration,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        includes: formData.includes.split(",").map((s) => s.trim()).filter(Boolean),
        available: true,
        bookings: 0,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60"],
      };
      setPackagesList([...packagesList, newPackage]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const toggleAvailability = (id: string) => {
    setPackagesList((prev) =>
      prev.map((pkg) =>
        pkg.id === id ? { ...pkg, available: !pkg.available } : pkg
      )
    );
  };

  return (
    <DashboardLayout
      title="Travel Packages"
      subtitle="Create and manage your travel packages"
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-search w-full sm:w-80"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleCreateClick}>
                <Plus className="h-4 w-4" />
                Create Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPackage ? "Edit Package" : "Create New Package"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Package Name</Label>
                  <Input
                    placeholder="e.g., Kandy Esala Perahera Tour"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Input
                      placeholder="e.g., Kandy, Sri Lanka"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 3 Days / 2 Nights"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the package experience..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Includes (comma-separated)</Label>
                  <Input
                    placeholder="e.g., Hotel, Guide, Transport, Temple Tickets"
                    value={formData.includes}
                    onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  />
                </div>

                {/* Activities Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Activities (Day by Day)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                      <Plus className="mr-1 h-3 w-3" /> Add Day
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                    {activities.map((activity, index) => (
                      <div key={index} className="grid gap-2 rounded-lg border p-3 relative bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Day {activity.day}</span>
                          {activities.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/20"
                              onClick={() => removeActivity(index)}
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="e.g., Morning Temple Visit"
                          className="h-8"
                          value={activity.title}
                          onChange={(e) => updateActivity(index, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="e.g., Visit the Temple of the Tooth Relic..."
                          className="min-h-[60px] text-sm"
                          value={activity.description}
                          onChange={(e) => updateActivity(index, "description", e.target.value)}
                        />

                        {/* Activity Image Upload */}
                        <div className="mt-2">
                          <Label className="text-xs mb-1.5 block">Activity Image (Optional)</Label>
                          {!activity.image ? (
                            <div
                              className="border border-dashed border-input rounded-md p-3 hover:bg-muted/50 transition-colors cursor-pointer text-center relative"
                            >
                              <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => handleActivityImageUpload(index, e)}
                              />
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Upload className="h-3.5 w-3.5" />
                                <span className="text-xs">Upload Image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative aspect-video w-32 rounded-md overflow-hidden bg-muted border">
                              <img src={activity.image} alt="Activity" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeActivityImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-destructive hover:text-white transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-3">
                  <Label>Package Images</Label>
                  <div
                    className="border-2 border-dashed border-input rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer text-center"
                    onClick={triggerFileUpload}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-2 bg-background rounded-full border shadow-sm">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click or drag images to upload</p>
                      <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WEBP</p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {images.map((url, index) => (
                        <div key={index} className="relative group aspect-video rounded-md overflow-hidden bg-muted border">
                          <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {images.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 opacity-50 mb-2" />
                      <span className="text-xs">No images added</span>
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={handleSavePackage}>
                  {editingPackage ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg",
                pkg.available ? "border-border" : "border-muted opacity-75"
              )}
            >
              {/* Gradient Header */}
              <div className="h-24 bg-gradient-to-br from-primary via-primary to-accent/80" />

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/packages/${pkg.id}`} className="hover:underline">
                      <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {pkg.destination}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.available}
                      onCheckedChange={() => toggleAvailability(pkg.id)}
                    />
                    {pkg.available ? (
                      <Eye className="h-4 w-4 text-success" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {pkg.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {pkg.includes.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                  {pkg.includes.length > 3 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      +{pkg.includes.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {pkg.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{pkg.bookings} bookings</p>
                    <p className="text-lg font-bold text-foreground">
                      ${pkg.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleEditClick(pkg)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Packages;
