import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  Camera,
  Upload,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialProfile = {
  name: "John Doe",
  email: "john.doe@travelagent.com",
  phone: "+94 77 123 4567",
  location: "Colombo, Sri Lanka",
  company: "Sri Lanka Travel Experts",
  bio: "Experienced travel agent specializing in Sri Lankan tours, from cultural heritage sites to pristine beaches. Over 8 years of experience creating unforgettable island adventures.",
  memberSince: "March 2020",
  totalTrips: 156,
  totalRevenue: 84200,
  rating: 4.8,
  completionRate: 94,
  image: "",
};

const reviews = [
  {
    id: "R001",
    customer: "Sarah Johnson",
    rating: 5,
    comment: "Absolutely fantastic service! John organized the perfect Cultural Triangle tour. Sigiriya was breathtaking.",
    date: "2024-05-15",
    trip: "Sigiriya, Dambulla",
    package: "Cultural Triangle Heritage",
  },
  {
    id: "R002",
    customer: "Michael Chen",
    rating: 5,
    comment: "The train ride to Ella was magical. Great hotel recommendations in Nuwara Eliya.",
    date: "2024-05-10",
    trip: "Ella, Badulla",
    package: "Hill Country Train Adventure",
  },
  {
    id: "R003",
    customer: "Emma Wilson",
    rating: 4,
    comment: "Wonderful beach vacation in Mirissa. Whale watching was a highlight.",
    date: "2024-05-02",
    trip: "Mirissa, Matara",
    package: "Southern Coastal Bliss",
  },
  {
    id: "R004",
    customer: "Robert Taylor",
    rating: 5,
    comment: "Best travel agent for a Yala safari! We saw three leopards. Unforgettable.",
    date: "2024-04-28",
    trip: "Yala National Park",
    package: "Wild Yala Safari",
  },
  {
    id: "R005",
    customer: "David Brown",
    rating: 3,
    comment: "Good trip generally, but the traffic in Colombo was heavy.",
    date: "2024-04-20",
    trip: "Colombo",
    package: "Colombo City Tour",
  },
  {
    id: "R006",
    customer: "Lisa Anderson",
    rating: 5,
    comment: "Our honeymoon in Galle was a dream come true. The Fort is beautiful.",
    date: "2024-04-15",
    trip: "Galle Fort, Galle",
    package: "Southern Coastal Bliss",
  },
  {
    id: "R007",
    customer: "James Martin",
    rating: 4,
    comment: "Loved the food in Jaffna. The guide was very knowledgeable about Tamil culture.",
    date: "2024-04-05",
    trip: "Jaffna",
    package: "Jaffna Tamil Culture",
  },
  {
    id: "R008",
    customer: "Jennifer White",
    rating: 5,
    comment: "The hiking in Ella was amazing. Perfectly organized transport.",
    date: "2024-03-28",
    trip: "Ella, Badulla",
    package: "Hill Country Train Adventure",
  },
  {
    id: "R009",
    customer: "William Turner",
    rating: 2,
    comment: "Had some issues with hotel check-in at Kandy. Could have been better coordinated.",
    date: "2024-03-15",
    trip: "Kandy",
    package: "Cultural Triangle Heritage",
  },
  {
    id: "R010",
    customer: "Jessica Lee",
    rating: 5,
    comment: "Polonnaruwa ruins were stunning. Historical richness is incredible.",
    date: "2024-03-10",
    trip: "Polonnaruwa",
    package: "Cultural Triangle Heritage",
  },
];

const Profile = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [editForm, setEditForm] = useState(initialProfile);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imgFilter, setImgFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Extract unique values for filters
  const destinations = Array.from(new Set(reviews.map((r) => r.trip)));
  const packages = Array.from(new Set(reviews.map((r) => r.package)));

  const filteredReviews = reviews
    .filter((review) => {
      if (ratingFilter !== "all" && review.rating !== parseInt(ratingFilter)) return false;
      if (destinationFilter !== "all" && review.trip !== destinationFilter) return false;
      if (packageFilter !== "all" && review.package !== packageFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const handleEditOpen = () => {
    setEditForm(profile);
    setIsEditDialogOpen(true);
  };

  const handleCreateProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditForm({ ...editForm, image: imageUrl });
    }
  };

  const removeProfileImage = () => {
    setEditForm({ ...editForm, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditDialogOpen(false);
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Manage your profile and view performance"
      showSearch={false}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="relative mx-auto w-fit group">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {profile.image ? (
                  <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-3xl font-bold text-primary-foreground">
                    {profile.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                onClick={handleEditOpen}
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.company}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(profile.rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                      }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-foreground">
                  {profile.rating}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">Member since {profile.memberSince}</span>
              </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-6 w-full gap-2" onClick={handleEditOpen}>
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Image Upload Area */}
                  <div className="flex flex-col items-center gap-4 mb-2">
                    <div
                      className="relative h-24 w-24 rounded-full border-2 border-dashed border-input flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {editForm.image ? (
                        <>
                          <img src={editForm.image} alt="Preview" className="h-full w-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Camera className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleCreateProfileImage}
                      />
                    </div>
                    {editForm.image && (
                      <Button variant="ghost" size="sm" onClick={removeProfileImage} className="text-xs text-destructive h-6">
                        Remove Photo
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={editForm.email}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Performance Stats */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Performance</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Trips</span>
                <span className="font-semibold text-foreground">{profile.totalTrips}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="font-semibold text-foreground">
                  ${profile.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-semibold text-success">{profile.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cancellation Rate</span>
                <span className="font-semibold text-destructive">
                  {100 - profile.completionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  What your customers are saying
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">
                  {reviews.filter((r) => r.rating >= 4).length} positive reviews
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Packages</SelectItem>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg} value={pkg}>
                      {pkg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6 space-y-4">
              {filteredReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviews match your filters.</p>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                          {review.customer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{review.customer}</p>
                          <p className="text-sm text-muted-foreground">{review.trip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                      {review.comment}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()} • {review.package}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">About Me</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
