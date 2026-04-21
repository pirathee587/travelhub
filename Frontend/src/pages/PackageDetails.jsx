import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    Clock,
    Sparkles,
    Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

const PackageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);
    const [reviewFilter, setReviewFilter] = useState("all");
    const [pkg, setPkg] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getPackageById(id),
            api.getPackageReviews(id),
        ]).then(([pkgData, reviewsData]) => {
            setPkg(pkgData);
            setReviews(reviewsData);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading package...</p>
                </div>
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

    const images = pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.imageUrl];

    return (
        <DashboardLayout>
            <div className="animate-slide-up space-y-6 max-w-5xl mx-auto pb-10">
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
                                {pkg.category ? pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1) : "Package"}
                            </Badge>
                            <div className="flex items-center text-sm text-yellow-500">
                                <span className="font-bold mr-1">★ {pkg.rating}</span>
                                <span className="text-muted-foreground">({pkg.reviewCount} reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            {pkg.packageName}
                        </h1>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            <span>{pkg.destination}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                        <p className="text-3xl font-bold text-primary">${pkg.priceFrom}</p>
                        <p className="text-sm text-muted-foreground mb-4">per person</p>
                        <Button
                            size="lg"
                            className="w-full gradient-ocean text-white shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate(`/explore/package/${pkg.id}/reserve`)}
                        >
                            Reserve Now
                        </Button>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px] lg:h-[500px]">
                    <div className="lg:col-span-2 h-full relative group rounded-2xl overflow-hidden shadow-lg">
                        <img
                            src={images[activeImage]}
                            alt={pkg.packageName}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                    </div>
                    <div className="hidden lg:grid grid-rows-2 gap-4 h-full">
                        {images.slice(1, 3).map((img, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl overflow-hidden cursor-pointer shadow-md"
                                onClick={() => setActiveImage(idx + 1)}
                            >
                                <img
                                    src={img}
                                    alt={`${pkg.packageName} ${idx + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto space-y-12 mt-10">
                    <section className="bg-card rounded-xl p-6 border shadow-sm">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Trip Overview
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Duration</label>
                                <p className="font-medium">{pkg.duration}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Start Place</label>
                                <p className="font-medium">{pkg.startPlace || "Not specified"}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">End Place</label>
                                <p className="font-medium">{pkg.endPlace || "Not specified"}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Agent</label>
                                <p className="font-medium flex items-center gap-1">
                                    <User className="h-3 w-3" /> {pkg.agentName || "Premium Travel"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Agent Rating</label>
                                <p className="font-medium">★ {pkg.agentRating}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Price Range</label>
                                <p className="font-medium">${pkg.priceFrom} - ${pkg.priceTo}</p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">District</label>
                                <p className="font-medium">{pkg.district || "Not specified"}</p>
                            </div>
                        </div>
                    </section>

                    {/* Day-by-Day Itinerary */}
                    <section className="space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Calendar className="h-6 w-6 text-primary" />
                            Day-by-Day Itinerary
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                            {pkg.itinerary?.map((item, idx) => (
                                <div key={idx} className="relative pl-12">
                                    <div className="absolute left-0 top-1 h-9 w-9 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                                        <span className="text-primary font-bold text-sm">{item.dayNumber}</span>
                                    </div>
                                    <div className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                            <h4 className="text-xl font-bold">
                                                Day {item.dayNumber}: {item.title}
                                            </h4>
                                            <Badge variant="secondary" className="w-fit bg-primary/5 text-primary border-primary/10">
                                                {item.activities?.length || 0} Activities
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed mb-6 italic">
                                            {item.description}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {item.activities?.map((activity, aIdx) => (
                                                <div key={aIdx} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl border border-border/50">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    <span className="text-sm font-medium">{activity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!pkg.itinerary && (
                                <div className="bg-muted/20 rounded-xl p-8 border border-dashed text-center">
                                    <p className="text-muted-foreground">Detailed itinerary arriving soon.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {pkg.festivalDetails && (
                        <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 p-6 rounded-r-xl">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                                <Sparkles className="h-5 w-5" /> Festival Special
                            </h3>
                            <p className="text-muted-foreground">{pkg.festivalDetails}</p>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold">Customer Reviews</h3>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star className="h-5 w-5 fill-yellow-500" />
                                <span>{pkg.rating}</span>
                                <span className="text-muted-foreground font-normal text-sm ml-1">({pkg.reviewCount} total)</span>
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
                            {reviews.length > 0 ? (
                                reviews
                                    .filter(review => reviewFilter === "all" || review.rating === reviewFilter)
                                    .map((review) => (
                                        <div key={review.id} className="bg-card rounded-xl p-6 border shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-primary/10">
                                                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
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
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="bg-muted/30 rounded-xl p-10 border border-dashed flex flex-col items-center justify-center text-center">
                                    <Sparkles className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-muted-foreground">No reviews yet for this package.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PackageDetails;