import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/common/ui/sheet";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Separator } from "@/components/common/ui/separator";
import { Progress } from "@/components/common/ui/progress";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/common/ui/dialog";
import { toast } from "sonner";
import refundService from "@/services/refundService";
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
import { useTouristCurrency } from "@/features/tourist/hooks/TouristCurrencyContext";

const statusConfig = {
    pending: {
        label: "Pending",
        className: "bg-warning/10 text-warning border-warning/20",
    },
    confirmed: {
        label: "Confirmed",
        className: "bg-primary/10 text-primary border-primary/20",
    },
    paid: {
        label: "Paid",
        className: "bg-success/10 text-success border-success/20",
    },
    refund_requested: {
        label: "Refund Requested",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    refunded: {
        label: "Refunded",
        className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
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
    
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [bankName, setBankName] = useState("");
    const [accountNo, setAccountNo] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [branchName, setBranchName] = useState("");
    const [reason, setReason] = useState("");
    const [submittingRefund, setSubmittingRefund] = useState(false);

    if (!trip) return null;

    const handleRequestRefund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bankName || !accountNo || !accountHolderName || !branchName) {
            toast.error("Please fill all required fields");
            return;
        }
        setSubmittingRefund(true);
        try {
            const bookingId = trip.id;
            await refundService.requestRefund(bookingId, {
                bankName,
                accountNo,
                accountHolderName,
                branchName,
                reason
            });
            toast.success("Refund request submitted successfully!");
            setRefundDialogOpen(false);
            onOpenChange(false);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            const msg = err.response?.data?.message || "Failed to submit refund request";
            toast.error(msg);
        } finally {
            setSubmittingRefund(false);
        }
    };

    const status = statusConfig[trip.status?.toLowerCase()] || statusConfig.pending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-1">
                    <SheetTitle className="text-2xl font-bold">{trip.destination || trip.packageName}</SheetTitle>
                    <p className="text-muted-foreground text-sm">{trip.packageName}</p>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Trip Image */}
                    <div className="relative h-56 rounded-xl overflow-hidden shadow-sm border border-border/50">
                        <img                                                                    
                            src={trip.imageUrl}
                            alt={trip.destination}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
                        
                        {/* Top Overlay: Badges and Agent */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold shadow-sm">
                                    {trip.packageType === 'MULTI_DISTRICT' ? 'Multi District' : 'Single District'}
                                </Badge>
                                <Badge className={cn(
                                    "bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold shadow-sm",
                                    trip.status === 'confirmed' ? "text-green-300" : ""
                                )}>
                                    {status.label}
                                </Badge>
                            </div>
                            
                            {trip.agencyName && (
                                <div 
                                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full pl-2.5 pr-3 py-1.5 flex items-center gap-1.5 cursor-pointer hover:bg-black/60 transition-all shadow-sm"
                                    onClick={() => {
                                        if (trip.agentId) {
                                            navigate(`/tourist/agents/${trip.agentId}`);
                                            onOpenChange(false);
                                        }
                                    }}
                                    title="View Agency Profile"
                                >
                                    <Building2 className="h-3.5 w-3.5 text-white/70" />
                                    <span className="text-white text-xs font-medium hover:underline">{trip.agencyName}</span>
                                </div>
                            )}
                        </div>

                        {/* Bottom Overlay: Dates */}
                        <div className="absolute bottom-4 left-4 text-white">
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
                    {trip.status?.toLowerCase() === "confirmed" || trip.status?.toLowerCase() === "paid" || trip.status?.toLowerCase() === "in_progress" ? (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Driver Details
                                </h3>
                                {trip.driverName ? (
                                    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{trip.driverName}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Star className="h-4 w-4 fill-warning text-warning" />
                                                <span>{trip.driverRating || "New"}</span>
                                                <span>•</span>
                                                <span>{trip.driverTrips || 0} trips</span>
                                            </div>
                                            {trip.driverPhone && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{trip.driverPhone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-secondary/50 text-center text-sm text-muted-foreground">
                                        Driver information not available
                                    </div>
                                )}
                            </div>
                            <Separator />
                        </>
                    ) : trip.driverName && (
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
                                            <span>{trip.driverRating || "New"}</span>
                                            <span>•</span>
                                            <span>{trip.driverTrips || 0} trips</span>
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
                    {trip.packageType !== "MULTI_DISTRICT" && (
                        <>
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Hotel Information
                                </h3>
                                {trip.hotelName ? (
                                    <div className="p-3 rounded-lg bg-secondary/50 space-y-2 hover:bg-secondary/70 transition-colors">
                                        <p className="font-medium text-primary hover:underline cursor-pointer" onClick={() => {
                                            if (trip.hotelId) {
                                                navigate(`/tourist/hotels/${trip.hotelId}`);
                                                onOpenChange(false);
                                            }
                                        }}>
                                            {trip.hotelName}
                                        </p>
                                        {trip.hotelLocation && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span>{trip.hotelLocation}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-secondary/50 text-center text-sm text-muted-foreground">
                                        Hotel not selected yet
                                    </div>
                                )}
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
                                <span className="text-primary"><TripPriceDisplay amount={trip.totalPrice} /></span>
                            </div>
                            {trip.status?.toLowerCase() === "confirmed" && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            const paymentId = trip.id;
                                            navigate(`/tourist/payment/${paymentId}`);
                                            onOpenChange(false);
                                        }}
                                    >
                                        Pay Now
                                    </Button>
                                </div>
                            )}
                            {trip.status?.toLowerCase() === "paid" && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
                                        onClick={() => setRefundDialogOpen(true)}
                                    >
                                        Request Refund
                                    </Button>
                                </div>
                            )}
                            {trip.status?.toLowerCase() === "refund_requested" && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        disabled
                                    >
                                        Refund Requested
                                    </Button>
                                </div>
                            )}
                            {trip.status?.toLowerCase() === "refunded" && (
                                <div className="mt-4">
                                    <Button
                                        className="w-full bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                        disabled
                                    >
                                        Refunded
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>


                </div>
            </SheetContent>

            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request Refund</DialogTitle>
                        <DialogDescription>
                            Please enter your bank transfer details. The agent will process your refund manually via bank deposit.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRequestRefund} className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Bank Name *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md text-sm"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                placeholder="e.g. Commercial Bank"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Account Number *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md text-sm"
                                value={accountNo}
                                onChange={(e) => setAccountNo(e.target.value)}
                                placeholder="e.g. 1000293412"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Account Holder Name *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md text-sm"
                                value={accountHolderName}
                                onChange={(e) => setAccountHolderName(e.target.value)}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Branch Name *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md text-sm"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                                placeholder="e.g. Colombo 07"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Reason for Refund</label>
                            <textarea
                                className="w-full p-2 border rounded-md text-sm"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Describe why you want a refund..."
                                rows={2}
                            />
                        </div>
                        <DialogFooter className="pt-2 gap-2 flex-row justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRefundDialogOpen(false)}
                                disabled={submittingRefund}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={submittingRefund}
                            >
                                {submittingRefund ? "Submitting..." : "Submit Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
    const { formatPrice } = useTouristCurrency();
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span>{formatPrice(value)}</span>
        </div>
    );
}

function TripPriceDisplay({ amount }: { amount: any }) {
    const { formatPrice } = useTouristCurrency();
    return <>{formatPrice(amount)}</>;
}

function HotelNameById({ id }) {
    const { data: hotel, isLoading } = useHotelById(id);
    if (isLoading) return <span className="text-muted-foreground">Loading...</span>;
    if (!hotel) return <span className="text-muted-foreground">Unknown Hotel</span>;
    return <span>{hotel.hotelName}</span>;
}