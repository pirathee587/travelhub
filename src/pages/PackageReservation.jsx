import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Calendar,
    Users,
    Building2,
    MapPin,
    DollarSign,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

const PackageReservation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [specialRequests, setSpecialRequests] = useState("");

    const [hotelPreferences, setHotelPreferences] = useState([
        { id: "pref-1", preferenceNumber: 1, hotel: null, isMandatory: false },
        { id: "pref-2", preferenceNumber: 2, hotel: null, isMandatory: false },
    ]);

    useEffect(() => {
        api.getPackageById(id).then(data => {
            setPkg(data);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        const selectedHotelId = searchParams.get("selectedHotel");
        const preferenceNumber = searchParams.get("preference");

        if (selectedHotelId && preferenceNumber) {
            api.getHotelById(selectedHotelId).then(hotel => {
                if (hotel) {
                    setHotelPreferences((prev) =>
                        prev.map((pref) =>
                            pref.preferenceNumber === parseInt(preferenceNumber)
                                ? { ...pref, hotel }
                                : pref
                        )
                    );
                    navigate(`/explore/package/${id}/reserve`, { replace: true });
                }
            });
        }
    }, [searchParams, id, navigate]);

    const handleSelectHotel = (preferenceNumber) => {
    navigate(
        `/hotels?mode=select&preference=${preferenceNumber}&returnTo=/explore/package/${id}/reserve&district=${pkg.district}`
    );
};

    const handleAddOptionalHotel = () => {
        const nextNumber = hotelPreferences.length > 0 ? Math.max(...hotelPreferences.map(p => p.preferenceNumber)) + 1 : 1;
        setHotelPreferences([
            ...hotelPreferences,
            {
                id: `pref-${Date.now()}`,
                preferenceNumber: nextNumber,
                hotel: null,
                isMandatory: false,
            },
        ]);
    };

    const handleRemoveOptionalHotel = (prefId) => {
        setHotelPreferences((prev) => prev.filter((pref) => pref.id !== prefId));
    };

    const mandatoryHotelsSelected = hotelPreferences
        .filter((pref) => pref.isMandatory)
        .every((pref) => pref.hotel !== null);

    const calculateTotalPrice = () => {
        const basePrice = pkg?.priceFrom || 0;
        const hotelTotal = hotelPreferences.reduce((sum, pref) => {
            if (pref.hotel) {
                return sum + (pref.hotel.priceFrom || 0);
            }
            return sum;
        }, 0);
        return basePrice + hotelTotal;
    };

    const handleConfirmReservation = async () => {
        if (!mandatoryHotelsSelected || !startDate) return;

        setSubmitting(true);

        const selectedHotel = hotelPreferences.find(p => p.hotel)?.hotel;

        const bookingData = {
            userId: 1,
            packageId: parseInt(id),
            hotelId: selectedHotel ? selectedHotel.id : null,
            vehicleId: 1,
            startDate: startDate,
            endDate: startDate,
            totalPrice: calculateTotalPrice(),
        };

        try {
            const booking = await api.createBooking(bookingData);
            if (booking && booking.id) {
                alert(`Booking confirmed! Booking ID: BK${String(booking.id).padStart(5, "0")}`);
                navigate("/trips");
            }
        } catch (error) {
            alert("Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
                        The package you are trying to reserve does not exist.
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
            <div className="animate-slide-up space-y-6 max-w-6xl mx-auto pb-10">
                {/* Navigation */}
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/explore/package/${id}`)}
                    className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Package Details
                </Button>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Reserve Your Package
                    </h1>
                    <p className="text-muted-foreground">
                        Complete your booking details and select your preferred hotels
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Package Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {pkg.packageName}
                                </CardTitle>
                                <CardDescription>
                                    {pkg.destination} • {pkg.duration}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-primary/20 text-primary">
                                        {pkg.category?.charAt(0).toUpperCase() + pkg.category?.slice(1)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        ★ {pkg.rating} ({pkg.reviewCount} reviews)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Booking Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="adults">Adults</Label>
                                        <Input
                                            id="adults"
                                            type="number"
                                            min="1"
                                            value={adults}
                                            onChange={(e) => setAdults(parseInt(e.target.value))}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="children">Children</Label>
                                        <Input
                                            id="children"
                                            type="number"
                                            min="0"
                                            value={children}
                                            onChange={(e) => setChildren(parseInt(e.target.value))}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                                    <Textarea
                                        id="specialRequests"
                                        placeholder="Any special requirements or requests..."
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        className="bg-background min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hotel Preferences */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Hotel Preferences
                                </CardTitle>
                                <CardDescription>
                                    Add optional hotels for your stay
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hotelPreferences.map((pref) => (
                                    <div
                                        key={pref.id}
                                        className={cn(
                                            "p-4 rounded-lg border transition-all",
                                            pref.hotel
                                                ? "bg-primary/5 border-primary/20"
                                                : "bg-muted/30 border-border"
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    Hotel Preference {pref.preferenceNumber}
                                                </span>
                                                {pref.isMandatory && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Required
                                                    </Badge>
                                                )}
                                            </div>
                                            {!pref.isMandatory && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveOptionalHotel(pref.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {pref.hotel ? (
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                            {pref.hotel.hotelName}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {pref.hotel.destination}
                                                        </p>
                                                        <p className="text-sm font-medium text-primary mt-1">
                                                            ${pref.hotel.priceFrom} - ${pref.hotel.priceTo} per night
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSelectHotel(pref.preferenceNumber)}
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => handleSelectHotel(pref.preferenceNumber)}
                                            >
                                                <Building2 className="mr-2 h-4 w-4" />
                                                Select Hotel
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {mandatoryHotelsSelected && (
                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed"
                                        onClick={handleAddOptionalHotel}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Optional Hotel
                                    </Button>
                                )}

                                {!mandatoryHotelsSelected && (
                                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                        <p className="text-sm text-amber-600">
                                            Please select both required hotels to continue
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Package</span>
                                        <span className="font-medium">${pkg.priceFrom}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Guests
                                        </span>
                                        <span className="font-medium">
                                            {adults} Adults, {children} Children
                                        </span>
                                    </div>
                                    {hotelPreferences.filter((p) => p.hotel).length > 0 && (
                                        <div className="pt-2 border-t">
                                            <p className="text-sm font-medium mb-2">Selected Hotels</p>
                                            {hotelPreferences
                                                .filter((p) => p.hotel)
                                                .map((pref) => (
                                                    <div key={pref.id} className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground truncate mr-2">
                                                            {pref.hotel?.hotelName}
                                                        </span>
                                                        <span className="font-medium whitespace-nowrap">
                                                            ${pref.hotel?.priceFrom}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-semibold">Estimated Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            ${calculateTotalPrice()}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full gradient-ocean text-white shadow-lg"
                                        size="lg"
                                        disabled={!mandatoryHotelsSelected || !startDate || submitting}
                                        onClick={handleConfirmReservation}
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        {submitting ? "Confirming..." : "Confirm Reservation"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full mt-2"
                                        size="sm"
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Contact Agent
                                    </Button>

                                    <p className="text-xs text-muted-foreground text-center mt-3">
                                        You won't be charged yet
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PackageReservation;