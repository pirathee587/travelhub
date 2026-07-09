import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    Clock,
    Sparkles,
    Star,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Grid,
    Building2,
    Bus, Train, Ticket, BedDouble, Binoculars, Receipt,
    Camera, Map, Headphones, ShoppingBag, Umbrella, Bike, Mountain, Tent, Ship, Plane,
    Utensils, Coffee, ShieldCheck, Wifi, CheckCircle2, Car
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
import { useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/features/tourist/services/utils";
import { usePackageById, usePackageReviews, usePackageRating } from "@/features/tourist/hooks/useApi";
import { DetailSkeleton } from "@/components/common/ui/skeletons";
import { EditReviewDialog } from "@/features/tourist/components/dashboard/EditReviewDialog";
import { DeleteConfirmDialog } from "@/features/tourist/components/dashboard/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/features/tourist/services/api";
import { defaultUserId } from "@/features/tourist/services/userHelpers";
import { useAuth } from "@/context/AuthContext";

const getInclusionIcon = (inclusion) => {
    const lower = inclusion.toLowerCase();
    
    // Transport & Flights
    if (lower.includes("flight") || lower.includes("airfare") || lower.includes("plane") || lower.includes("airport")) return <Plane className="h-4 w-4" />;
    if (lower.includes("transport") || lower.includes("vehicle") || lower.includes("car") || lower.includes("van") || lower.includes("pick") || lower.includes("drop") || lower.includes("transfer")) return <Car className="h-4 w-4" />;
    if (lower.includes("bus") || lower.includes("coach")) return <Bus className="h-4 w-4" />;
    if (lower.includes("train") || lower.includes("rail")) return <Train className="h-4 w-4" />;
    if (lower.includes("boat") || lower.includes("cruise") || lower.includes("ferry") || lower.includes("ship") || lower.includes("water")) return <Ship className="h-4 w-4" />;
    
    // Food & Drinks
    if (lower.includes("meal") || lower.includes("food") || lower.includes("breakfast") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("dining") || lower.includes("snack")) return <Utensils className="h-4 w-4" />;
    if (lower.includes("water") || lower.includes("drink") || lower.includes("beverage") || lower.includes("juice")) return <Coffee className="h-4 w-4" />;
    
    // Guide & Staff
    if (lower.includes("audio") || lower.includes("headset")) return <Headphones className="h-4 w-4" />;
    if (lower.includes("guide") || lower.includes("driver") || lower.includes("escort") || lower.includes("staff")) return <User className="h-4 w-4" />;
    
    // Tickets & Fees
    if (lower.includes("ticket") || lower.includes("entry") || lower.includes("entrance") || lower.includes("pass") || lower.includes("fee")) return <Ticket className="h-4 w-4" />;
    if (lower.includes("tax") || lower.includes("charge") || lower.includes("surcharge")) return <Receipt className="h-4 w-4" />;
    
    // Accommodation & Camping
    if (lower.includes("camp") || lower.includes("tent")) return <Tent className="h-4 w-4" />;
    if (lower.includes("hotel") || lower.includes("accommodation") || lower.includes("stay") || lower.includes("room") || lower.includes("lodge") || lower.includes("resort")) return <BedDouble className="h-4 w-4" />;
    
    // Activities & Gear
    if (lower.includes("safari") || lower.includes("wildlife") || lower.includes("park") || lower.includes("tour") || lower.includes("sightseeing")) return <Binoculars className="h-4 w-4" />;
    if (lower.includes("hike") || lower.includes("trek") || lower.includes("climb") || lower.includes("mountain")) return <Mountain className="h-4 w-4" />;
    if (lower.includes("bike") || lower.includes("bicycle") || lower.includes("cycling")) return <Bike className="h-4 w-4" />;
    if (lower.includes("photo") || lower.includes("camera")) return <Camera className="h-4 w-4" />;
    if (lower.includes("shop") || lower.includes("souvenir")) return <ShoppingBag className="h-4 w-4" />;
    
    // Utilities & Insurance
    if (lower.includes("insurance") || lower.includes("safety") || lower.includes("medical")) return <ShieldCheck className="h-4 w-4" />;
    if (lower.includes("wifi") || lower.includes("internet") || lower.includes("data")) return <Wifi className="h-4 w-4" />;
    if (lower.includes("map") || lower.includes("itinerary")) return <Map className="h-4 w-4" />;
    if (lower.includes("umbrella") || lower.includes("rain")) return <Umbrella className="h-4 w-4" />;
    
    return <CheckCircle2 className="h-4 w-4" />;
};

const PackageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [activeImage, setActiveImage] = useState(0);
    const [reviewFilter, setReviewFilter] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeletingReview, setIsDeletingReview] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Lightbox State
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    // SWR hooks — parallel fetching with caching
    const { data: pkg, isLoading: pkgLoading } = usePackageById(id);
    const { data: reviews = [], mutate: mutateReviews } = usePackageReviews(id);
    const { data: ratingInfo = { averageRating: 0, reviewCount: 0 } } = usePackageRating(id);

    // Memoize sorted itinerary
    const sortedItinerary = useMemo(() =>
        pkg?.itinerary?.slice().sort((a, b) => a.dayNumber - b.dayNumber) || [],
        [pkg?.itinerary]
    );

    // Memoize filtered reviews
    const filteredReviews = useMemo(() =>
        reviews.filter(review => reviewFilter === "all" || review.rating === reviewFilter),
        [reviews, reviewFilter]
    );

    const visibleReviews = useMemo(() => {
        return showAllReviews ? filteredReviews : filteredReviews.slice(0, 6);
    }, [filteredReviews, showAllReviews]);

    // ✅ Edit review handler
    const handleEditReview = useCallback((review) => {
        setEditingReview(review);
        setIsEditDialogOpen(true);
    }, []);

    // ✅ Delete review handler - shows confirmation
    const handleDeleteReview = useCallback((review) => {
        setIsDeletingReview(review);
        setIsDeleteDialogOpen(true);
    }, []);

    // ✅ Confirm delete handler
    const handleConfirmDelete = useCallback(async () => {
        if (!isDeletingReview?.id) return;

        setIsDeleting(true);
        try {
            console.log("[DEBUG] Deleting review:", isDeletingReview.id);
            await api.deleteReview(isDeletingReview.id, defaultUserId());
            
            toast({
                title: "Review Deleted",
                description: "Your review has been deleted successfully.",
                variant: "default",
            });

            // Refresh reviews list
            await mutateReviews();
            setIsDeleteDialogOpen(false);
            setIsDeletingReview(null);
        } catch (error) {
            console.error("[DEBUG] Delete failed:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete review",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [isDeletingReview, mutateReviews, toast]);

    // ✅ Edit success handler
    const handleEditSuccess = useCallback(() => {
        console.log("[DEBUG] Review edited, refreshing reviews list");
        mutateReviews();
    }, [mutateReviews]);

    if (pkgLoading) {
        return (
            <DashboardLayout>
                <DetailSkeleton />
            </DashboardLayout>
        );
    }

    if (!pkg) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h2 className="text-2xl font-bold mb-2">Package Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The package you are looking for does not exist.
                    </p>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const allImages = pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.imageUrl];
    const galleryImages = [0, 1, 2].map((index) => allImages[index] || allImages[0]);

    // Lightbox Handlers
    const openLightbox = (index = 0) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };
    const closeLightbox = () => setIsLightboxOpen(false);
    const goLightboxPrev = (e) => {
        if (e) e.stopPropagation();
        setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
    };
    const goLightboxNext = (e) => {
        if (e) e.stopPropagation();
        setLightboxIndex((i) => (i + 1) % allImages.length);
    };
    const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) diff > 0 ? goLightboxNext() : goLightboxPrev();
    };

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-6 max-w-[1440px] mx-auto pb-10">
                {/* Navigation */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/explore`)}
                    className="pl-0 hover:bg-transparent hover:text-primary transition-colors mb-2"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
                </Button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                                {pkg.category ? pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1) : "Package"}.  {/* Category of Package */}
                            </Badge>
                            {/* show live-calculated rating from review  */}
                            <div className="flex items-center text-sm text-yellow-500">
                                <span className="font-bold mr-1">★ {ratingInfo.averageRating || 0}</span>          {/* Average Rating */}
                                <span className="text-muted-foreground">({ratingInfo.reviewCount || 0} reviews)</span>  {/* Number of reviews */}
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            {pkg.packageName}                                                 {/* Package Name */}
                        </h1>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span>{pkg.district}</span>
                        </div>
                        {pkg.packageType && (
                            <div className="mt-2 flex items-center gap-1.5">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                                    {pkg.packageType.replace('_', ' ')}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="flex flex-col items-end gap-1 mb-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between w-full min-w-[150px] items-center">
                                <span className="text-sm font-semibold text-foreground/80">Adult</span>
                                <span className="text-lg font-bold text-primary">${pkg.basePriceAdult} <span className="text-xs text-muted-foreground font-normal">/ person</span></span>
                            </div>
                            <div className="flex justify-between w-full min-w-[150px] items-center">
                                <span className="text-sm font-semibold text-foreground/80">Child</span>
                                <span className="text-lg font-bold text-primary">${pkg.basePriceChild} <span className="text-xs text-muted-foreground font-normal">/ person</span></span>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="w-full gradient-ocean text-white shadow-lg hover:shadow-xl transition-all"
                            onClick={() => {
                                if (!user) {
                                    navigate("/login");
                                } else {
                                    navigate(`/tourist/explore/package/${pkg.id}/reserve`);
                                }
                            }}
                        >
                            Reserve Now
                        </Button>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="relative">
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:h-[440px] mb-8 lg:mb-10 items-stretch">
                        <div
                            className={cn(
                                "relative group rounded-2xl overflow-hidden shadow-lg h-[340px] lg:h-full cursor-pointer",
                                activeImage === 0 && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}
                            onClick={() => openLightbox(0)}
                        >
                        <img
                            src={galleryImages[0]}
                            alt={`${pkg.packageName} main view`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 lg:h-full min-h-0">
                        {galleryImages.slice(1, 3).map((img, idx) => {
                            const imageIndex = idx + 1;
                            return (
                                <div
                                    key={imageIndex}
                                    className={cn(
                                        "relative group rounded-2xl overflow-hidden shadow-md cursor-pointer h-[160px] lg:h-full min-h-0",
                                        activeImage === imageIndex && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                    )}
                                    onClick={() => openLightbox(imageIndex)}
                                >
                                    <img
                                        src={img}
                                        alt={`${pkg.packageName} ${imageIndex + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            );
                        })}
                    </div>

                    {/* See More Button */}
                    {allImages.length > 0 && (
                        <Button
                            variant="secondary"
                            className="absolute bottom-4 right-4 z-10 gap-2 font-semibold shadow-md hover:bg-white hover:text-black transition-colors"
                            onClick={() => openLightbox(0)}
                        >
                            <Grid className="w-4 h-4" /> See all {allImages.length} photos
                        </Button>
                    )}
                </div>
                </div>
                {/* Image End */}

                {/* Content Section */}
                <div className="relative z-10 w-full space-y-12 mt-10 lg:mt-14">
                    <section className="bg-card rounded-xl p-6 border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Trip Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Duration</label>
                                <p className="font-medium">{pkg.duration}</p>                               {/* Duration */}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Start Place</label>
                                <p className="font-medium">{pkg.startPlace || "Not specified"}</p>             {/* Start Place*/}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">End Place</label>
                                <p className="font-medium">{pkg.endPlace || "Not specified"}</p>                 {/* End Place*/}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Agency</label>
                                {pkg.agentId ? (
                                    <button
                                        id="pkg-agent-link"
                                        onClick={() => navigate(`/tourist/agents/${pkg.agentId}`)}
                                        className="font-medium flex items-center gap-1 text-primary hover:underline hover:text-primary/80 transition-colors"
                                    >
                                        <User className="h-3 w-3" /> {pkg.agentName || "View Agent"}  {/* Clickable Agent Name*/}
                                    </button>
                                ) : (
                                    <p className="font-medium flex items-center gap-1">
                                        <User className="h-3 w-3" /> {pkg.agentName || "Premium Travel"}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Base Price</label>
                                <p className="font-medium">Starts from ${pkg.basePriceAdult}</p>               {/* Base Price*/}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">District</label>
                                <p className="font-medium">{pkg.district || "Not specified"}</p>               {/* District*/}
                            </div>
                        </div>
                    </section>

                    {/* What's Included */}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-primary" /> What's Included
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {pkg.inclusions.map((inclusion, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-accent/10 p-4 rounded-xl border border-accent/20 hover:shadow-sm transition-all">
                                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-accent shadow-sm">
                                            {getInclusionIcon(inclusion)}
                                        </div>
                                        <span className="text-sm font-medium capitalize">{inclusion}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Day-by-Day Itinerary */}
                    <section className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-primary" />
                            Day-by-Day Itinerary
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                        {/* Order by Day number */}
                            {sortedItinerary.map((item, idx) => (                                                                                  // Map Function
                                <div key={idx} className="relative pl-12">
                                    <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                                        <span className="text-primary font-bold text-sm">{item.dayNumber}</span>
                                    </div>
                                    <div className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <h4 className="text-xl font-bold">
                                                Day {item.dayNumber}: {item.title}                                              {/* Day number and title */}
                                            </h4>

                                            {/*Activities Count*/}
                                            <Badge variant="secondary" className="w-fit bg-primary/5 text-primary border-primary/10">
                                                {item.activities?.length || 0} Activities                                           {/* Activities Count*/}
                                            </Badge>
                                            
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed mb-6 italic">
                                            {item.description}                                                                {/* Description*/}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {item.activities?.map((activity, aIdx) => {
                                                 const hasImage = activity && typeof activity === 'object' && activity.imageUrl;
                                                 const desc = activity && typeof activity === 'object' ? activity.description : activity;
                                                 return (
                                                     <div key={aIdx} className="flex flex-col gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50 hover:shadow-sm transition-all">
                                                         <div className="flex items-start gap-2">
                                                             <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                                             <span className="text-sm font-semibold text-foreground">
                                                                 Activity {aIdx + 1}: {desc}
                                                             </span>
                                                         </div>
                                                         {hasImage && (
                                                             <div 
                                                                 className="mt-1 overflow-hidden rounded-lg border border-border/60 cursor-pointer"
                                                                 onClick={() => setSelectedImage(activity.imageUrl)}
                                                             >
                                                                 <img
                                                                     src={activity.imageUrl}
                                                                     alt={desc}
                                                                     className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500"
                                                                 />
                                                             </div>
                                                         )}
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                        {pkg.packageType === "MULTI_DISTRICT" && item.hotelName && (
                                            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium text-primary">
                                                    Going to Stay In:{" "}
                                                    {item.hotelId ? (
                                                        <button
                                                            onClick={() => navigate(`/tourist/hotels/${item.hotelId}`)}
                                                            className="underline hover:text-primary/80 transition-colors font-bold cursor-pointer text-base ml-1"
                                                        >
                                                            {item.hotelName}
                                                        </button>
                                                    ) : (
                                                        <span className="font-bold text-base ml-1">{item.hotelName}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {sortedItinerary.length === 0 && (
                                <div className="bg-muted/20 rounded-xl p-8 border border-dashed text-center">
                                    <p className="text-muted-foreground">Detailed itinerary arriving soon.</p>          {/* if no acitivies */}
                                </div>
                            )}
                        </div>
                    </section>

                    {pkg.festivalDetails && (
                        <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 p-6 rounded-r-xl">      {/* If Festival assign*/}
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                                <Sparkles className="h-5 w-5" /> Festival Special
                            </h3>
                            <p className="text-muted-foreground">{pkg.festivalDetails}</p>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section className="bg-card rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" /> Customer Reviews
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="h-5 w-5 fill-yellow-500" />
                                <span>{ratingInfo.averageRating || 0}</span>                    {/* Average Rating*/}
                                <span className="text-muted-foreground font-normal text-sm ml-1">
                                    ({ratingInfo.reviewCount || 0} total)                        {/* Total Reviews*/}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pb-2">
                            {["all", 5, 4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setReviewFilter(rating)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                        reviewFilter === rating
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                                    )}
                                >
                                    {rating === "all" ? "All Reviews" : `${rating } ★`}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {visibleReviews.length > 0 ? (
                                visibleReviews.map((review) => {
                                    const isReviewOwner = review.userId === defaultUserId();
                                    return (
                                        <div key={review.id} className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-primary/10">
                                                        <AvatarFallback>
                                                            {review.userName ? review.userName.charAt(0).toUpperCase() : "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{review.userName}</p>                  {/* User Name */}
                                                        <p className="text-xs text-muted-foreground">{review.reviewDate}</p>        {/* Date */}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "h-3.5 w-3.5",
                                                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    {/* ✅ Edit and Delete buttons - only for review owner */}
                                                    {isReviewOwner && (
                                                        <div className="flex gap-1 ml-2 pl-2 border-l border-border">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditReview(review)}
                                                                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                                                                title="Edit review"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteReview(review)}
                                                                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                                title="Delete review"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {review.title && <h4 className="font-bold text-base">{review.title}</h4>}       {/* Review Title */}
                                                <p className="text-sm leading-relaxed text-muted-foreground italic">
                                                    "{review.comment}"
                                                </p>                                                                            {/* Review Comment */}
                                                {review.imageUrls && review.imageUrls.length > 0 && (
                                                    <div className="flex gap-2 pt-2 flex-wrap">
                                                        {review.imageUrls.map((url, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={url}                                                           //Review image
                                                                alt={`Review image ${idx + 1}`}
                                                                className="h-20 w-20 rounded-lg object-cover border border-border cursor-pointer"
                                                                onClick={() => setSelectedImage(url)}                               //open image - Light Box
                                                                loading="lazy"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-muted/30 rounded-xl p-10 border border-dashed flex flex-col items-center justify-center text-center col-span-full">
                                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-muted-foreground">No reviews yet for this package.</p>               {/* No Reviews */}
                                </div>
                            )}
                        </div>
                        {filteredReviews.length > 6 && (
                            <div className="flex justify-center mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(!showAllReviews)}
                                    className="hover:bg-primary hover:text-white transition-all"
                                >
                                    {showAllReviews ? "Show Less" : "Read More"}
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Gallery Image Lightbox */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center select-none"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-white">
                        <div className="font-medium text-sm">
                            {lightboxIndex + 1} / {allImages.length}
                        </div>
                        <button
                            className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                            onClick={closeLightbox}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Image Container */}
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        <img
                            src={allImages[lightboxIndex]}
                            alt={`Image ${lightboxIndex + 1}`}
                            className="max-w-full max-h-full object-contain pointer-events-none select-none transition-transform duration-300"
                        />
                        
                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={goLightboxPrev}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button
                                    onClick={goLightboxNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Review Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="Review image full view"
                            className="max-w-full max-h-[90vh] rounded-xl object-contain"
                        />
                        <button
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* ✅ Edit Review Dialog */}
            <EditReviewDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                review={editingReview}
                targetName={pkg?.packageName || "Package"}
                onSuccess={handleEditSuccess}
                isPackageReview={true}
            />

            {/* ✅ Delete Confirm Dialog */}
            <DeleteConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                reviewTitle={isDeletingReview?.title}
            />
        </DashboardLayout>
    );
};

export default PackageDetails;
