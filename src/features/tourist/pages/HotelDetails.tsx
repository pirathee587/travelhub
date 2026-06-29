import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import {
    ArrowLeft,
    MapPin,
    Star,
    Wifi,
    Utensils,
    Waves,
    Car,
    Coffee,
    CheckCircle2,
    Wind,
    Dumbbell,
    Beer,
    Tv,
    Shirt,
    ConciergeBell,
    ShieldCheck,
    Trees,
    Briefcase,
    Sparkles,
    Palmtree,
    PawPrint,
    CigaretteOff,
    BedDouble,
    ImageOff,
    Clock,
    Calendar,
    User,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Grid,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/common/ui/avatar";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/features/tourist/services/utils";
import { useHotelById, useHotelReviews, useHotelRating, useHotelRooms, useHotelImages } from "@/features/tourist/hooks/useApi";
import { HotelDetailSkeleton } from "@/components/common/ui/skeletons";
import { EditReviewDialog } from "@/features/tourist/components/dashboard/EditReviewDialog";
import { DeleteConfirmDialog } from "@/features/tourist/components/dashboard/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/features/tourist/services/api";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const [reviewFilter, setReviewFilter] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
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

    // SWR hooks — parallel cached fetching
    const { data: hotel, isLoading: hotelLoading } = useHotelById(id);
    const { data: reviews = [], mutate: mutateReviews } = useHotelReviews(id);
    const { data: ratingInfo = { averageRating: 0, reviewCount: 0 } } = useHotelRating(id);
    const { data: rooms = [], isLoading: roomsLoading } = useHotelRooms(id);
    const { data: hotelImages = [] } = useHotelImages(id); // all images from hotel_images table

    const isSelectionMode = searchParams.get("mode") === "select";
    const preferenceNumber = searchParams.get("preference");
    const returnTo = searchParams.get("returnTo");

    // Memoize filtered reviews
    const filteredReviews = useMemo(() =>
        reviews.filter(review => reviewFilter === "all" || review.rating === reviewFilter),
        [reviews, reviewFilter]
    );

    const visibleReviews = useMemo(() => {
        return showAllReviews ? filteredReviews : filteredReviews.slice(0, 6);
    }, [filteredReviews, showAllReviews]);

    // Price range calculation for rooms
    const roomPriceRange = useMemo(() => {
        const validPrices = rooms
            .map((room) => Number(room?.price))
            .filter((price) => Number.isFinite(price) && price > 0);

        if (validPrices.length === 0) {
            return { priceFrom: null, priceTo: null };
        }

        return {
            priceFrom: Math.min(...validPrices),   //Minimum price among rooms
            priceTo: Math.max(...validPrices),    //Maximum price among rooms
        };
    }, [rooms]);

    const priceFrom = roomPriceRange.priceFrom;
    const priceTo = roomPriceRange.priceTo;
    const hasPriceRange = Number.isFinite(priceFrom) && Number.isFinite(priceTo);
    const startingPriceText = Number.isFinite(priceFrom) ? `$${priceFrom}` : "Not Available";
    const priceRangeText = hasPriceRange ? `$${priceFrom} - $${priceTo}` : "Not Available";

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

    const handleSelectHotel = () => {
        if (isSelectionMode && returnTo && preferenceNumber && id) {
            navigate(`${decodeURIComponent(returnTo)}?selectedHotel=${id}&preference=${preferenceNumber}`);
        }
    };

    //Amenties icon selection
    const getAmenityIcon = (amenity) => {
        const lower = amenity.toLowerCase();
        if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="h-4 w-4" />;
        if (lower.includes("food") || lower.includes("dining") || lower.includes("restaurant") || lower.includes("breakfast") || lower.includes("meal")) return <Utensils className="h-4 w-4" />;
        if (lower.includes("pool") || lower.includes("swimming")) return <Waves className="h-4 w-4" />;
        if (lower.includes("spa") || lower.includes("massage") || lower.includes("wellness") || lower.includes("sauna")) return <Sparkles className="h-4 w-4" />;
        if (lower.includes("parking") || lower.includes("car") || lower.includes("valet")) return <Car className="h-4 w-4" />;
        if (lower.includes("coffee") || lower.includes("tea")) return <Coffee className="h-4 w-4" />;
        if (lower.includes("gym") || lower.includes("fitness") || lower.includes("workout") || lower.includes("exercise")) return <Dumbbell className="h-4 w-4" />;
        if (lower.includes("ac") || lower.includes("air conditioning") || lower.includes("cooling")) return <Wind className="h-4 w-4" />;
        if (lower.includes("bar") || lower.includes("drink") || lower.includes("cocktail") || lower.includes("wine") || lower.includes("beer")) return <Beer className="h-4 w-4" />;
        if (lower.includes("tv") || lower.includes("television") || lower.includes("satellite")) return <Tv className="h-4 w-4" />;
        if (lower.includes("laundry") || lower.includes("washing") || lower.includes("dry cleaning")) return <Shirt className="h-4 w-4" />;
        if (lower.includes("service") || lower.includes("concierge") || lower.includes("reception") || lower.includes("bell")) return <ConciergeBell className="h-4 w-4" />;
        if (lower.includes("safe") || lower.includes("security") || lower.includes("locker")) return <ShieldCheck className="h-4 w-4" />;
        if (lower.includes("garden") || lower.includes("park") || lower.includes("nature") || lower.includes("trail")) return <Trees className="h-4 w-4" />;
        if (lower.includes("business") || lower.includes("meeting") || lower.includes("conference")) return <Briefcase className="h-4 w-4" />;
        if (lower.includes("beach") || lower.includes("ocean") || lower.includes("sea")) return <Palmtree className="h-4 w-4" />;
        if (lower.includes("pet") || lower.includes("dog") || lower.includes("animal")) return <PawPrint className="h-4 w-4" />;
        if (lower.includes("non-smoking") || lower.includes("smoke-free")) return <CigaretteOff className="h-4 w-4" />;
        
        return <CheckCircle2 className="h-4 w-4" />;
    };

    if (hotelLoading) {
        return (
            <DashboardLayout>
                <HotelDetailSkeleton />
            </DashboardLayout>
        );
    }

    if (!hotel) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h2 className="text-2xl font-bold mb-2">Hotel Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The hotel you are looking for does not exist.
                    </p>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // Build the full image list from the dedicated /api/hotels/{id}/images endpoint
    // which queries the hotel_images table directly using hotel_id.
    // Fallback: legacy hotel.imageUrl field for older records that haven't been migrated.
    const allImages = hotelImages.length > 0
        ? hotelImages
        : (hotel.imageUrl ? [hotel.imageUrl] : []);

    // The gallery shows 3 slots (1 large + 2 small). Extra images appear in a thumbnail strip below.
    const galleryImages = [0, 1, 2].map((index) => allImages[index] || null);
    const remainingCount = allImages.length - 3;

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
                <div className="flex items-center justify-between mb-2">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
                    </Button>
                    {isSelectionMode && (
                        <Badge variant="outline" className="border-primary text-primary bg-primary/5">
                            Selecting for Preference {preferenceNumber}
                        </Badge>
                    )}
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                                {hotel.destination}                                         {/* Hotel Destination */}
                            </Badge>
                            <div className="flex items-center text-sm text-yellow-500">
                                <Star className="h-4 w-4 fill-current mr-1" />                       {/* Hotel Rating */}
                                <span className="font-bold mr-1">{ratingInfo.averageRating || 0}</span>    {/* Average Rating */}
                                <span className="text-muted-foreground">({ratingInfo.reviewCount || 0} reviews)</span> {/* Review Count */}
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">    
                            {hotel.hotelName}                                                {/* Hotel Name */}
                        </h1>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span>{hotel.location}</span>                                    {/* Hotel Location */}
                        </div>
                    </div>
                    <div className="text-right w-full md:w-auto">
                        <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                        <div className="flex items-baseline justify-end gap-1 mb-4">
                            <span className="text-3xl font-bold text-primary">{startingPriceText}</span>
                            <span className="text-sm text-muted-foreground">/ night</span>
                        </div>
                        {isSelectionMode ? (
                            <Button
                                className="w-full gradient-ocean text-white shadow-lg hover:shadow-xl transition-all"
                                onClick={handleSelectHotel}
                            >
                                Select This Hotel
                            </Button>
                        ) : (
                             <Button
                                className="w-full gradient-ocean text-white shadow-lg hover:shadow-xl transition-all"
                                onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                View Rooms                              {/* "View Rooms" Button */}
                            </Button>
                        )}
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
                            {galleryImages[0] ? (
                                <img
                                    src={galleryImages[0]}
                                    alt={`${hotel.hotelName} main view`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="eager"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40 bg-muted/20 gap-2">
                                    <ImageOff className="h-12 w-12" />
                                    <span className="text-sm">No Images Available</span>
                                </div>
                            )}
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
                                        onClick={() => img && openLightbox(imageIndex)}
                                    >
                                    {img ? (
                                        <>
                                            <img
                                                src={img}
                                                alt={`${hotel.hotelName} ${imageIndex + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 bg-muted/10">
                                            <ImageOff className="h-8 w-8" />
                                        </div>
                                    )}
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

                {/* Content Section */}
                <div className="relative z-10 w-full space-y-12 mt-10 lg:mt-14">
                    {/* Hotel Overview */}
                    <section className="bg-card rounded-xl p-6 border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Hotel Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Rating</label>
                                <p className="font-medium flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" /> {ratingInfo.averageRating || 0} ({ratingInfo.reviewCount || 0} reviews)
                                </p>                                                             {/*  AverageRating */}         {/* Rating Count */}  
                            </div>
                            
                            {/* Price Calculation above */}

                            <div>
                                { /* Display Maximum price fo hotel from rooms */ }
                                <label className="text-sm text-muted-foreground block mb-1">Price From</label>
                                <p className="font-medium">{Number.isFinite(priceFrom) ? `$${priceFrom}` : "Not Available"}</p>
                            </div>
                            <div>
                                { /* Display Minimum price for hotel from rooms */ }
                                <label className="text-sm text-muted-foreground block mb-1">Price To</label>
                                <p className="font-medium">{Number.isFinite(priceTo) ? `$${priceTo}` : "Not Available"}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Address</label>
                                <p className="font-medium text-xm truncate" title={hotel.location}>
                                    {hotel.location}
                                </p>                                             {/* Address */}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Destination</label>
                                <p className="font-medium">{hotel.destination}</p>                 {/*Destination*/}
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">District</label>
                                <p className="font-medium">{hotel.district}</p>                 {/*District*/}  
                            </div>
                        </div>
                    </section>

                    {/* About section */}
                    <section className="space-y-4">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-primary" /> About this Hotel
                        </h3>
                        <div className="bg-card rounded-2xl p-6 border shadow-sm">
                            <p className="text-muted-foreground leading-relaxed capitalize">
                                {hotel.description}
                            </p>
                        </div>
                    </section>

                    {/* Amenities */}
                    <section className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Waves className="h-6 w-6 text-primary" /> Popular Amenities
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {hotel.amenities?.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50 hover:shadow-sm transition-all">
                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-sm">
                                        {getAmenityIcon(amenity)}   {/* Icon from above function */}
                                    </div>
                                    <span className="text-sm font-medium capitalize">{amenity}</span> {/*Amenities name*/}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rooms section */}
                    <section id="rooms" className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <BedDouble className="h-6 w-6 text-primary" /> Available Rooms
                        </h3>
                        {roomsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="rounded-2xl border border-border bg-card h-80 animate-pulse" />
                                ))}
                            </div>
                        ) : rooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-muted">
                                            {room?.imageUrl ? (
                                                <img
                                                    src={room.imageUrl}
                                                    alt={room.name || "Room"}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onClick={() => setSelectedImage(room.imageUrl)}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                    <ImageOff className="h-10 w-10" />          {/*Room Image*/}
                                                </div>  
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge className="bg-primary/90 text-white border-none shadow">
                                                    {room.type || "Standard"}                       {/* Room Type */}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg font-bold text-primary shadow-sm border border-white/50">
                                                ${room?.price || 0} <span className="text-[10px] font-normal text-muted-foreground uppercase">/ night</span>            {/* Room Price */}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors tracking-tight capitalize">
                                                {room?.name} {/*Room Name*/}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 capitalize">
                                                {room.description}              {/* Room Description */}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-muted/20 rounded-xl p-10 border border-dashed text-center">
                                <p className="text-muted-foreground">No rooms listed for this hotel yet.</p>
                            </div>
                        )}
                    </section>

                    {/* Reviews section */}
                    <section className="bg-card rounded-2xl border shadow-sm p-6 lg:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" /> Guest Reviews
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="h-5 w-5 fill-yellow-500" />
                                <span>{ratingInfo.averageRating || 0}</span>           {/* Average Rating */}
                                <span className="text-muted-foreground font-normal text-sm ml-1">
                                    ({ratingInfo.reviewCount || 0} total)              {/* Total Reviews */}
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
                                    {rating === "all" ? "All Reviews" : `${rating} ★`}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <div className={cn(
                                "grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ease-in-out",
                                !showAllReviews && filteredReviews.length > 6 ? "max-h-[520px] overflow-hidden" : ""
                            )}>
                                {filteredReviews.length > 0 ? (
                                    filteredReviews.map((review) => {
                                        const isReviewOwner = review.userId === defaultUserId();
                                        return (
                                        <div key={review.id} className="bg-background rounded-xl p-6 border shadow-sm space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-primary/10">
                                                    <AvatarFallback className="gradient-ocean text-white font-bold">
                                                        {review.userName ? review.userName.charAt(0).toUpperCase() : "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{review.userName}</p>                  {/* User Name */}
                                                    <p className="text-xs text-muted-foreground">{review.reviewDate}</p>       {/* Review Date */}
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
                                            </p>                                                                           {/* Review Comment */}
                                            {review.imageUrls && review.imageUrls.length > 0 && (                          
                                                <div className="flex gap-2 pt-2 flex-wrap">
                                                    {review.imageUrls.map((url, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={url}                                                       //Review iamge
                                                            alt={`Review image ${idx + 1}`}
                                                            className="h-20 w-20 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setSelectedImage(url)}                           //open image - Image LightBox
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
                                    <p className="text-muted-foreground">No guest reviews yet.</p>
                                </div>
                            )}
                            </div>

                            {/* Gradient Overlay and Read More Button */}
                            {!showAllReviews && filteredReviews.length > 6 && (
                                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-card via-card/90 to-transparent flex items-end justify-center pb-4 z-20">
                                    <Button
                                        onClick={() => setShowAllReviews(true)}
                                        className="gradient-ocean text-white shadow-lg hover:shadow-xl transition-all font-semibold rounded-xl px-8 py-2.5"
                                    >
                                        Read More
                                    </Button>
                                </div>
                            )}
                        </div>
                        {showAllReviews && filteredReviews.length > 6 && (
                            <div className="flex justify-center mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAllReviews(false)}
                                    className="hover:bg-primary hover:text-white transition-all font-semibold"
                                >
                                    Show Less
                                </Button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Image Lightbox */}
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

            {/* ✅ Edit Review Dialog */}
            <EditReviewDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                review={editingReview}
                targetName={hotel?.hotelName || "Hotel"}
                onSuccess={handleEditSuccess}
                isPackageReview={false}
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

export default HotelDetails;

