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
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [reviewFilter, setReviewFilter] = useState("all");
    const [hotel, setHotel] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    // ✅ NEW: live average rating from backend
    const [ratingInfo, setRatingInfo] = useState({ averageRating: 0, reviewCount: 0 });

    const isSelectionMode = searchParams.get("mode") === "select";
    const preferenceNumber = searchParams.get("preference");
    const returnTo = searchParams.get("returnTo");

    useEffect(() => {
        Promise.all([
            api.getHotelById(id),
            api.getHotelReviews(id),
            // ✅ FIXED: fetch live-calculated average rating
            api.getHotelAverageRating(id),
        ]).then(([hotelData, reviewsData, ratingData]) => {
            setHotel(hotelData);
            setReviews(reviewsData || []);
            setRatingInfo(ratingData || { averageRating: 0, reviewCount: 0 });
            setLoading(false);
        });
    }, [id]);

    const handleSelectHotel = () => {
        if (isSelectionMode && returnTo && preferenceNumber && id) {
            navigate(`${decodeURIComponent(returnTo)}?selectedHotel=${id}&preference=${preferenceNumber}`);
        }
    };

    const getAmenityIcon = (amenity) => {
        const lower = amenity.toLowerCase();
        if (lower.includes("wifi")) return <Wifi className="h-4 w-4" />;
        if (lower.includes("food") || lower.includes("dining") || lower.includes("restaurant") || lower.includes("breakfast")) return <Utensils className="h-4 w-4" />;
        if (lower.includes("pool") || lower.includes("spa")) return <Waves className="h-4 w-4" />;
        if (lower.includes("parking") || lower.includes("car")) return <Car className="h-4 w-4" />;
        if (lower.includes("coffee") || lower.includes("tea")) return <Coffee className="h-4 w-4" />;
        return <CheckCircle2 className="h-4 w-4" />;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading hotel...</p>
                </div>
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

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-8 max-w-6xl mx-auto pb-10">
                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hotels
                    </Button>
                    {isSelectionMode && (
                        <Badge variant="outline" className="border-primary text-primary">
                            Selecting for Preference {preferenceNumber}
                        </Badge>
                    )}
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                                {hotel.destination}
                            </Badge>
                            {/* ✅ FIXED: show live average rating from backend */}
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
                    <div className="text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-sm text-muted-foreground">Starting from</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-primary">${hotel.priceFrom}</span>
                                <span className="text-sm text-muted-foreground">/ night</span>
                            </div>
                        </div>
                        {isSelectionMode && (
                            <Button
                                className="mt-4 gradient-ocean text-white"
                                onClick={handleSelectHotel}
                            >
                                Select This Hotel
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image */}
                <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg border border-border">
                    <img
                        src={hotel.imageUrl}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="space-y-8">
                    {/* Description */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">About this Hotel</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {hotel.description}
                        </p>
                    </section>

                    {/* Amenities */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Popular Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-3 gap-x-6">
                            {hotel.amenities?.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                        {getAmenityIcon(amenity)}
                                    </div>
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Price Info */}
                    <section className="bg-card rounded-xl p-6 border shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Price Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Price From</label>
                                <p className="font-bold text-xl text-primary">${hotel.priceFrom} / night</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Price To</label>
                                <p className="font-bold text-xl text-primary">${hotel.priceTo} / night</p>
                            </div>
                        </div>
                    </section>

                    {/* Reviews */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-semibold">Guest Reviews</h2>
                            {/* ✅ FIXED: live average rating */}
                            <div className="flex items-center text-sm text-yellow-500">
                                <Star className="h-4 w-4 fill-current mr-1" />
                                <span className="font-bold mr-1">{ratingInfo.averageRating || 0}</span>
                                <span className="text-muted-foreground">({ratingInfo.reviewCount || 0} total reviews)</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.length > 0 ? (
                                reviews
                                    .filter(review => reviewFilter === "all" || review.rating === reviewFilter)
                                    .map((review) => (
                                        <div key={review.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full gradient-ocean flex items-center justify-center text-white font-bold text-xs">
                                                        {/* ✅ FIXED: field is `userName` from backend */}
                                                        {review.userName ? review.userName.charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                    <div>
                                                        {/* ✅ FIXED: `userName` and `reviewDate` */}
                                                        <p className="font-medium text-sm">{review.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{review.reviewDate}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn(
                                                                "h-3 w-3",
                                                                i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.title && <h4 className="font-bold text-base mb-1">{review.title}</h4>}
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
                                                            className="h-20 w-20 rounded-lg object-cover border border-border"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                            ) : (
                                <div className="col-span-full bg-muted/20 rounded-xl p-8 border border-dashed text-center">
                                    <p className="text-muted-foreground">No reviews available yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HotelDetails;
