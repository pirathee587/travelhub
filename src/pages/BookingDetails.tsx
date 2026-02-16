
import { useParams, useNavigate } from "react-router-dom";
import { bookings, statusBadge } from "@/data/bookings";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Calendar,
    Car,
    User,
    ArrowLeft,
    Mail,
    MoreHorizontal,
    Download,
    Building,
    Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const booking = bookings.find((b) => b.id === id);

    if (!booking) {
        return (
            <DashboardLayout title="Booking Details" showSearch={false}>
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold">Booking not found</h2>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate("/bookings")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Bookings
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title={`Booking ${booking.id}`}
            subtitle="View complete booking information"
            showSearch={false}
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => navigate("/bookings")}
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to List
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Invoice
                        </Button>
                        {booking.status === "active" && (
                            <Button>Mark as Completed</Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-destructive">
                                    Cancel Booking
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Card */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">Customer Information</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-primary-foreground">
                                    {booking.customerName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">{booking.customerName}</h4>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{booking.customerEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{booking.contactNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trip Details */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Trip Details</h3>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                                        statusBadge[booking.status]
                                    )}
                                >
                                    {booking.status}
                                </span>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>Destination</span>
                                    </div>
                                    <p className="font-medium">{booking.destination}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Travel Dates</span>
                                    </div>
                                    <p className="font-medium">{booking.travelDates}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building className="h-4 w-4" />
                                        <span>Package</span>
                                    </div>
                                    <p className="font-medium">{booking.packageType}</p>
                                </div>
                            </div>
                        </div>
                        {/* Vehicle & Driver */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">Vehicle & Driver</h3>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Car className="h-4 w-4" />
                                        <span>Vehicle</span>
                                    </div>
                                    <p className="font-medium">{booking.vehicle}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>Driver</span>
                                    </div>
                                    <p className="font-medium">{booking.driver}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Info */}
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="mb-4 text-lg font-semibold">Payment Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Amount</span>
                                    <span>${booking.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (0%)</span>
                                    <span>$0</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${booking.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BookingDetails;
