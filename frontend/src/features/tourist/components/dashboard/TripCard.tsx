//Only on MyTrip page and OverView page 

import { Calendar, ChevronRight, Star, CreditCard } from "lucide-react";
import placeholderImg from "@/assets/images/placeholder.jpg";
import { cn } from "@/features/tourist/services/utils";
import { Progress } from "@/components/common/ui/progress";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { useNavigate } from "react-router-dom";

const statusConfig = {                                    // Status Badge Color Settings
    pending: {
        label: "Pending",
        className: "bg-muted text-warning font-bold border-warning",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-muted text-primary font-bold border-primary",
    },
    in_progress: {
        label: "In Progress",
        className: "bg-muted text-success font-bold border-success",
    },
    completed: {
        label: "Completed",
        className: "bg-muted text-muted-foreground font-bold border-border",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-muted text-destructive font-bold border-destructive",
    },

};

export function TripCard({ trip, onClick, onReview, onHotelReview }: { trip: any, onClick?: any, onReview?: any, onHotelReview?: any }) {
    const status = statusConfig[trip.status] || statusConfig.pending; // Status Badge Logic
    const navigate = useNavigate();
    const averageRating = Number(trip.rating ?? 0).toFixed(1);
    const hasHotelReview = trip.hotelId != null || Boolean(trip.hotelName);
    const paymentId = trip.bookingId || trip.id;

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl bg-card border-2 border-primary/20",
                "shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/60 cursor-pointer"
            )}
        >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
                <img
                    src={trip.imageUrl || placeholderImg}
                    alt={trip.destination || "Trip"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-semibold text-primary-foreground">{trip.destination || "Trip"}</h3> {/*Destination name*/}
                            <p className="text-sm text-primary-foreground/80">{trip.packageName || "Package"}</p>  {/* Package name */}
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 backdrop-blur-md border border-white/30">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-white">{averageRating}</span> {/*Rating*/}
                        </div>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={cn("absolute top-3 right-3 border", status.className)}
                >
                    {status.label}  {/*Status Badge of the trip*/}
                </Badge>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{trip.startDate || "N/A"} - {trip.endDate || "N/A"}</span>    {/*Start and End date*/}
                    </div>
                </div>

                {trip.status === "in_progress" && trip.progress !== undefined && (  //Trip Progress Bar Only Visible when status is in_progress
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Trip Progress</span>
                            <span className="font-medium text-primary">{trip.progress}%</span>
                        </div>
                        <Progress value={trip.progress} className="h-2" />
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border mt-3">
                    <span className="text-lg font-semibold text-primary">${(trip.totalPrice || trip.price || 0).toLocaleString()}</span>     {/*Price of the trip*/}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {trip.status === "pending" && paymentId && (
                            <Button
                                size="sm"
                                className="h-8 text-xs font-bold gap-1 shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tourist/payment/${paymentId}`);
                                }}
                            >
                                <CreditCard className="h-3 w-3" />
                                Pay Now
                            </Button>
                        )}
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
                                    Trip Review                  {/*Trip Review Button Only Visible when status is completed*/}
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
                                        Hotel Review                     {/*Hotel Review Button Only Visible when status is completed*/}
                                    </Button>
                                )}
                            </>
                        )}
                        <div
                            className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all pl-2 whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (trip.packageId) {
                                    navigate(`/tourist/explore/package/${trip.packageId}`);       {/*Navigate to the package details page*/}
                                }
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
