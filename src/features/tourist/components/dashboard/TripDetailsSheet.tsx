import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/common/ui/sheet";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Separator } from "@/components/common/ui/separator";
import { Progress } from "@/components/common/ui/progress";
import {
    MapPin,
    Calendar,
    Car,
    User,
    Star,
    Navigation,
    CreditCard,
    FileText,
    Download,
    CheckCircle2,
    Circle,
    Building2,
    Phone,
} from "lucide-react";
import { cn } from "@/features/tourist/services/utils";
import { useHotelById } from "@/features/tourist/hooks/useApi";
import { useNavigate } from "react-router-dom";

const statusConfig = {
    pending: {
        label: "Pending",
        className: "bg-warning/10 text-warning border-warning/20",
    },
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
    rejected: {
        label: "Rejected",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    cancelled: {
        label: "Cancelled",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
};

export function TripDetailsSheet({ trip, open, onOpenChange }: { trip: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const navigate = useNavigate();
    if (!trip) return null;

    const status = statusConfig[trip.status] || statusConfig.pending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <SheetTitle className="text-xl">{trip.destination}</SheetTitle>         {/*Destination*/}
                        <Badge variant="outline" className={cn("border", status.className)}>
                            {status.label}                                                      {/*Booking Status*/}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{trip.packageName}</p>                 {/*Package Name*/}
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Trip Image */}
                    <div className="relative h-48 rounded-xl overflow-hidden">                  {/*Package Image*/}
                        <img                                                                    
                            src={trip.imageUrl}
                            alt={trip.destination}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-primary-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">{trip.startDate} - {trip.endDate}</span>          {/*Start Date and End Date*/}
                            </div>
                        </div>
                    </div>

                    {/* Booking ID */}
                    <div className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Booking ID</span>
                        <span className="font-mono font-medium">#{trip.bookingId}</span>                       {/*Booking Id*/}
                    </div>

                    {/* Booking Requirements */}
                    <>
                        <div className="space-y-3">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Booking Requirements
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <InfoItem label="Start Date" value={trip.startDate} />
                                <InfoItem label="Duration" value={trip.duration || "-"} />
                                <InfoItem label="Adults" value={trip.adults || 0} />
                                <InfoItem label="Children" value={trip.children || 0} />
                            </div>
                            {(() => {
                                let prefs = [];
                                try {
                                    if (trip.hotelIdsWithPreference) {
                                        const parsed = JSON.parse(trip.hotelIdsWithPreference);
                                        prefs = parsed.hotelIds || [];
                                    }
                                } catch (e) {
                                    // Ignore parse error
                                }
                                if (prefs.length === 0 && !trip.specialRequests) return null;
                                return (
                                    <div className="space-y-3">
                                        {prefs.length > 0 && (
                                            <div className="p-3 rounded-lg bg-secondary/50">
                                                <p className="text-xs text-muted-foreground mb-1">Hotel Preferences</p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    {prefs.map((id, index) => (
                                                        <div key={id} className="text-sm font-medium flex items-center gap-2">
                                                            <span className="text-muted-foreground text-xs">{index + 1}.</span>
                                                            <HotelNameById id={id} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {trip.specialRequests && (
                                            <div className="p-3 rounded-lg bg-secondary/50">
                                                <p className="text-xs text-muted-foreground mb-1">Special Requests</p>
                                                <p className="text-sm font-medium">{trip.specialRequests}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                        <Separator />
                    </>

                    {/* Live Status */}                                                                         {/*For In Progress Only*/}
                    {trip.status === "in_progress" && (                                                            
                        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                            <h3 className="font-semibold flex items-center gap-2 text-success">
                                <Navigation className="h-5 w-5" />
                                Live Status
                            </h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Trip Progress</span>
                                    <span className="font-medium">{trip.progress}%</span>
                                </div>
                                <Progress value={trip.progress} className="h-2" />
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Vehicle Information */}
                    {trip.vehicleType && (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Car className="h-5 w-5 text-primary" />
                                    Vehicle Information
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoItem label="Type" value={trip.vehicleType} />
                                    <InfoItem label="Model" value={trip.vehicleModel} />
                                    <InfoItem label="Registration" value={trip.vehicleRegistration} />
                                    <InfoItem label="Capacity" value={trip.vehicleCapacity} />
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Driver Details */}
                    {trip.driverName && (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Driver Details
                                </h3>
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{trip.driverName}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Star className="h-4 w-4 fill-warning text-warning" />
                                            <span>{trip.driverRating}</span>
                                            <span>•</span>
                                            <span>{trip.driverTrips} trips</span>
                                        </div>
                                        {trip.driverPhone && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <Phone className="h-3 w-3" />
                                                <span>{trip.driverPhone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Hotel Information */}
                    {trip.hotelName && (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Hotel Information
                                </h3>
                                <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                                    <p className="font-medium">{trip.hotelName}</p>
                                    {trip.hotelLocation && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{trip.hotelLocation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Route */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Travel Route
                        </h3>
                        <div className="p-3 rounded-lg bg-secondary/50 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="h-3 w-3 rounded-full bg-success mt-1.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Starting</p>
                                    <p className="font-medium">{trip.startPlace}</p>
                                </div>
                            </div>
                            <div className="ml-1.5 border-l-2 border-dashed border-border h-6" />
                            <div className="flex items-start gap-3">
                                <div className="h-3 w-3 rounded-full bg-accent mt-1.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Destination</p>
                                    <p className="font-medium">{trip.endPlace}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Price Breakdown
                        </h3>
                        <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                            <PriceRow label="Package Cost" value={trip.totalPrice} />
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span className="text-primary">${trip.totalPrice?.toLocaleString()}</span>
                            </div>
                            {trip.status === "pending" && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            const paymentId = trip.bookingId || trip.id;
                                            navigate(`/tourist/payment/${paymentId}`);
                                            onOpenChange(false);
                                        }}
                                    >
                                        Pay Now
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Documents
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {["Invoice", "Receipt", "Itinerary", "Confirmation"].map((doc) => (
                                <Button key={doc} variant="outline" size="sm" className="justify-start">
                                    <Download className="h-4 w-4 mr-2" />
                                    {doc}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function InfoItem({ label, value }) {
    return (
        <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

function PriceRow({ label, value }: { label: string, value: any }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span>${value?.toLocaleString()}</span>
        </div>
    );
}

function HotelNameById({ id }) {
    const { data: hotel, isLoading } = useHotelById(id);
    if (isLoading) return <span className="text-muted-foreground">Loading...</span>;
    if (!hotel) return <span className="text-muted-foreground">Unknown Hotel</span>;
    return <span>{hotel.hotelName}</span>;
}