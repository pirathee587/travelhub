import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useHotelById, useHotelReviews, useHotelRating, useHotelRooms } from "@/hooks/useApi";
import { HotelDetailSkeleton } from "@/components/ui/skeletons";

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [reviewFilter, setReviewFilter] = useState("all");
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    // SWR hooks — parallel cached fetching
    const { data: hotel, isLoading: hotelLoading } = useHotelById(id);
    const { data: reviews = [] } = useHotelReviews(id);
    const { data: ratingInfo = { averageRating: 0, reviewCount: 0 } } = useHotelRating(id);
    const { data: rooms = [], isLoading: roomsLoading } = useHotelRooms(id);

    const isSelectionMode = searchParams.get("mode") === "select";
    const preferenceNumber = searchParams.get("preference");
    const returnTo = searchParams.get("returnTo");

    // Memoize filtered reviews
    const filteredReviews = useMemo(() =>
        reviews.filter(review => reviewFilter === "all" || review.rating === reviewFilter),
        [reviews, reviewFilter]
    );

    // Memoize price range calculation for rooms
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

    const handleSelectHotel = () => {
        if (isSelectionMode && returnTo && preferenceNumber && id) {
            navigate(`${decodeURIComponent(returnTo)}?selectedHotel=${id}&preference=${preferenceNumber}`);
        }
    };

    //Amenties icon
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

    const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.imageUrl];
    const galleryImages = [0, 1, 2].map((index) => images[index] || images[0]);

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-6 max-w-5xl mx-auto pb-10">
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
                                {hotel.destination}
                            </Badge>
                            <div className="flex items-center text-sm text-yellow-500">
                                <Star className="h-4 w-4 fill-current mr-1" />
                                <span className="font-bold mr-1">{ratingInfo.averageRating || 0}</span>
                                <span className="text-muted-foreground">({ratingInfo.reviewCount || 0} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            {hotel.hotelName}
                        </h1>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span>{hotel.location}</span>
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
                                View Rooms
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 lg:h-[440px] mb-8 lg:mb-10 items-stretch">
                    <div
                        className={cn(
                            "relative group rounded-2xl overflow-hidden shadow-lg h-[340px] lg:h-full cursor-pointer",
                            activeImage === 0 && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                        onClick={() => {
                            setActiveImage(0);
                            setSelectedImage(galleryImages[0]);
                        }}
                    >
                        <img
                            src={galleryImages[0]}
                            alt={`${hotel.hotelName} main view`}
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
                                    onClick={() => {
                                        setActiveImage(imageIndex);
                                        setSelectedImage(img);
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`${hotel.hotelName} ${imageIndex + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 max-w-4xl mx-auto space-y-12 mt-10 lg:mt-14">
                    {/* Hotel Overview */}
                    <section className="bg-card rounded-xl p-6 border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Hotel Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Destination</label>
                                <p className="font-medium">{hotel.destination}</p>
                            </div>
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
                                <label className="text-sm text-muted-foreground block mb-1">Rating</label>
                                <p className="font-medium flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" /> {ratingInfo.averageRating || 0} ({ratingInfo.reviewCount || 0} reviews)
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Location</label>
                                <p className="font-medium text-xm truncate" title={hotel.location}>
                                    {hotel.location}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* About section */}
                    <section className="space-y-4">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-primary" /> About this Hotel
                        </h3>
                        <div className="bg-card rounded-2xl p-6 border shadow-sm">
                            <p className="text-muted-foreground leading-relaxed">
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
                                        {getAmenityIcon(amenity)}
                                    </div>
                                    <span className="text-sm font-medium capitalize">{amenity}</span>
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
                                                    <ImageOff className="h-10 w-10" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge className="bg-primary/90 text-white border-none shadow">
                                                    {room.type || "Standard"}
                                                </Badge>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg font-bold text-primary shadow-sm border border-white/50">
                                                ${room?.price || 0} <span className="text-[10px] font-normal text-muted-foreground uppercase">/ night</span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors tracking-tight">
                                                {room?.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                {room.description}
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
                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <User className="h-6 w-6 text-primary" /> Guest Reviews
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="h-5 w-5 fill-yellow-500" />
                                <span>{ratingInfo.averageRating || 0}</span>
                                <span className="text-muted-foreground font-normal text-sm ml-1">
                                    ({ratingInfo.reviewCount || 0} total)
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

                        <div className="space-y-4">
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <div key={review.id} className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-primary/10">
                                                    <AvatarFallback className="gradient-ocean text-white font-bold">
                                                        {review.userName ? review.userName.charAt(0).toUpperCase() : "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{review.userName}</p>
                                                    <p className="text-xs text-muted-foreground">{review.reviewDate}</p>
                                                </div>
                                            </div>
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
                                        </div>
                                        <div className="space-y-2">
                                            {review.title && <h4 className="font-bold text-base">{review.title}</h4>}
                                            <p className="text-sm leading-relaxed text-muted-foreground italic">
                                                "{review.comment}"
                                            </p>
                                            {review.imageUrls && review.imageUrls.length > 0 && (
                                                <div className="flex gap-2 pt-2 flex-wrap">
                                                    {review.imageUrls.map((url, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={url}
                                                            alt={`Review image ${idx + 1}`}
                                                            className="h-20 w-20 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setSelectedImage(url)}
                                                            loading="lazy"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-muted/30 rounded-xl p-10 border border-dashed text-center">
                                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-muted-foreground">No guest reviews yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img
                            src={selectedImage}
                            alt="Full view"
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
        </DashboardLayout>
    );
};

export default HotelDetails;

