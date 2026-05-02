import { Calendar, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const statusConfig = {
    confirmed: {
        label: "Confirmed",
        className: "bg-primary/10 text-primary border-primary/20",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-success/10 text-success border-success/20",
    },
    completed: {
        label: "Completed",
        className: "bg-muted text-muted-foreground border-border",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
};

export function TripCard({ trip, onClick, onReview, onHotelReview }) {
    const status = statusConfig[trip.status];
    const navigate = useNavigate();
    const averageRating = Number(trip.rating ?? 0).toFixed(1);
    const hasHotelReview = trip.hotelId != null || Boolean(trip.hotelName);

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-xl bg-card border border-border",
                "shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
            )}
        >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
                <img
                    src={trip.imageUrl}
                    alt={trip.destination}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-semibold text-primary-foreground">{trip.destination}</h3>
                            <p className="text-sm text-primary-foreground/80">{trip.packageName}</p>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-white">{averageRating}</span>
                            <span className="text-[11px] text-white/80">({trip.reviewCount ?? 0})</span>
                        </div>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={cn("absolute top-3 right-3 border", status.className)}
                >
                    {status.label}
                </Badge>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{trip.startDate} - {trip.endDate}</span>
                    </div>
                </div>

                {trip.status === "in_progress" && trip.progress !== undefined && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Trip Progress</span>
                            <span className="font-medium text-primary">{trip.progress}%</span>
                        </div>
                        <Progress value={trip.progress} className="h-2" />
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-lg font-semibold">${trip.price.toLocaleString()}</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {trip.status === "completed" && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs hover:bg-primary hover:text-white transition-colors flex-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onReview) onReview();
                                    }}
                                >
                                    Trip Review
                                </Button>
                                {hasHotelReview && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs hover:bg-accent hover:text-accent-foreground transition-colors flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onHotelReview) onHotelReview();
                                        }}
                                    >
                                        Hotel Review
                                    </Button>
                                )}
                            </>
                        )}
                        <div 
                            className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all pl-2 whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/explore/package/${trip.packageId}`);
                            }}
                        >
                            View Details
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
