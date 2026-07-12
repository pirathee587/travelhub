import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Textarea } from "@/components/common/ui/textarea";
import { Badge } from "@/components/common/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/common/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/common/ui/card";
import {
    ArrowLeft,
    Calendar,
    Users,
    Building2,
    MapPin,
    DollarSign,
    AlertCircle,
    X
} from "lucide-react";
import { api } from "@/features/tourist/services/api";
import { useAllHotels, useHotelRooms } from "@/features/tourist/hooks/useApi";
import { defaultUserId } from "@/features/tourist/services/userHelpers";
import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { toast } from "sonner";

const HotelPreferenceCard = ({ selection, index, onRemove, onUpdate, allHotels }) => {
    const { data: rooms } = useHotelRooms(selection.hotelId);
    const h = allHotels?.find(hotel => hotel.id.toString() === selection.hotelId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-white relative">
            <button type="button" onClick={() => onRemove(selection.hotelId)} className="absolute top-2 right-2 hover:bg-muted rounded-full p-1 text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
            </button>
            <div className="space-y-2 lg:col-span-1">
                <Label>Preference {index + 1}</Label>
                <div className="mt-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 py-1.5 px-3 whitespace-normal text-left">
                        {h?.hotelName || selection.hotelId}
                    </Badge>
                </div>
            </div>
            <div className="space-y-2 lg:col-span-3">
                <Label>Available Rooms</Label>
                <Select value={selection.roomName || ""} onValueChange={(v) => onUpdate(selection.hotelId, 'roomName', v)}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder={rooms?.length > 0 ? "Select a Room" : "No rooms found"} />
                    </SelectTrigger>
                    <SelectContent>
                        {rooms?.map(room => (
                            <SelectItem key={room.id} value={room.name}>
                                {room.name} {room.price ? `($${room.price})` : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

const PackageReservation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const today = (() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    })();

    const getSavedState = (key, defaultVal) => {
        try {
            const saved = sessionStorage.getItem(`reservation_state_${id}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed[key] !== undefined ? parsed[key] : defaultVal;
            }
        } catch(e) {}
        return defaultVal;
    };

    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [startDate, setStartDate] = useState(() => getSavedState('startDate', ""));
    const [adults, setAdults] = useState(() => getSavedState('adults', 1));
    const [children, setChildren] = useState(() => getSavedState('children', 0));
    const [specialRequests, setSpecialRequests] = useState(() => getSavedState('specialRequests', ""));
    
    const [accommodationOption, setAccommodationOption] = useState(() => getSavedState('accommodationOption', "BY_MY_OWN"));
    const [hotelSelections, setHotelSelections] = useState(() => getSavedState('hotelSelections', []));

    const { data: allHotels } = useAllHotels(null);

    const handleRemoveHotel = (val) => {
        setHotelSelections(hotelSelections.filter(s => s.hotelId !== val));
    };

    const updateSelection = (hotelId, key, value) => {
        setHotelSelections(hotelSelections.map(s => s.hotelId === hotelId ? { ...s, [key]: value } : s));
    };

    useEffect(() => {
        sessionStorage.setItem(`reservation_state_${id}`, JSON.stringify({
            startDate, adults, children, specialRequests, accommodationOption, hotelSelections
        }));
    }, [startDate, adults, children, specialRequests, accommodationOption, hotelSelections, id]);

    useEffect(() => {
        const selectedHotelId = searchParams.get("selectedHotel");
        if (selectedHotelId) {
            if (hotelSelections.length < 5 && !hotelSelections.some(s => s.hotelId === selectedHotelId)) {
                setHotelSelections(prev => [...prev, {
                    hotelId: selectedHotelId,
                    roomName: ""
                }]);
            }
            searchParams.delete("selectedHotel");
            searchParams.delete("preference");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, hotelSelections, setSearchParams]);

    useEffect(() => {
        api.getPackageById(id).then(data => {
            setPkg(data);
            setLoading(false);
        });
    }, [id]);

    const calculateTotalPrice = () => {
        const adultTotal = (adults || 0) * (pkg?.basePriceAdult || 0);
        const childTotal = (children || 0) * (pkg?.basePriceChild || 0);
        return adultTotal + childTotal;
    };

    const handleConfirmReservation = async () => {
        if (!startDate) {
            toast.error("Please select a start date");
            return;
        }

        setSubmitting(true);
        const userId = defaultUserId();

        const bookingData = {
            userId: userId,
            packageId: parseInt(id),
            startDate: startDate,
            totalPrice: calculateTotalPrice(),
            adults: adults || 1,
            children: children || 0,
            specialRequests: specialRequests,
            duration: pkg?.duration || "",
            hotelIds: hotelSelections.length > 0 ? hotelSelections.map(s => parseInt(s.hotelId)) : null,
            accommodationOption: pkg?.packageType === "SINGLE_DISTRICT" ? accommodationOption : null,
            bookingHotelPreferences: pkg?.packageType === "SINGLE_DISTRICT" && accommodationOption === "AGENCY_ARRANGE" ? hotelSelections : null,
        };

        try {
            const booking = await api.createBooking(bookingData);
            if (booking && booking.id) {
                sessionStorage.removeItem(`reservation_state_${id}`);
                toast.success(`Booking confirmed! Booking ID: BK${String(booking.id).padStart(5, "0")}`);
                navigate("/tourist/trips");
            }
        } catch (error) {
            const errorMsg = error.message || "Booking failed. Please try again.";
            console.error("[Booking] Error:", errorMsg);
            toast.error(errorMsg);
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
            <div className="animate-slide-up space-y-6 max-w-[1600px] mx-auto pb-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/tourist/explore/package/${id}`)}
                    className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Package Details
                </Button>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Reserve Your Package
                    </h1>
                    <p className="text-muted-foreground">
                        Complete your booking details for the trip
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="border-primary/20 text-primary">
                                        {pkg.category?.charAt(0).toUpperCase() + pkg.category?.slice(1)}
                                    </Badge>
                                    {pkg.packageType && (
                                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                                            {pkg.packageType.replace('_', ' ')}
                                        </Badge>
                                    )}
                                    <span className="text-sm text-muted-foreground ml-2">
                                        ★ {pkg.rating} ({pkg.reviewCount} reviews)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

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
                                        min={today}
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
                                            value={adults || ""}
                                            onChange={(e) => setAdults(e.target.value ? parseInt(e.target.value) : 1)}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="children">Children</Label>
                                        <Input
                                            id="children"
                                            type="number"
                                            min="0"
                                            value={children || ""}
                                            onChange={(e) => setChildren(e.target.value ? parseInt(e.target.value) : 0)}
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

                        {pkg.packageType === "SINGLE_DISTRICT" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Accommodation Preferences
                                    </CardTitle>
                                    <CardDescription>
                                        This is a single-district tour. You can arrange your own accommodation or let us handle it.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <RadioGroup value={accommodationOption} onValueChange={setAccommodationOption}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="BY_MY_OWN" id="by_my_own" />
                                            <Label htmlFor="by_my_own">I will decide my own accommodation</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="AGENCY_ARRANGE" id="agency_arrange" />
                                            <Label htmlFor="agency_arrange">Agency will arrange accommodation</Label>
                                        </div>
                                    </RadioGroup>

                                    {accommodationOption === "AGENCY_ARRANGE" && (
                                        <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-4">
                                            <Alert variant="default" className="bg-primary/5 text-primary border-primary/20">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Hotel cost is not included in the package total. It will be handled externally on arrival based on your preferences.
                                                </AlertDescription>
                                            </Alert>
                                            <div className="space-y-4">
                                                {hotelSelections.map((sel, index) => (
                                                    <HotelPreferenceCard
                                                        key={sel.hotelId}
                                                        selection={sel}
                                                        index={index}
                                                        onRemove={handleRemoveHotel}
                                                        onUpdate={updateSelection}
                                                        allHotels={allHotels}
                                                    />
                                                ))}

                                                {hotelSelections.length < 5 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-dashed rounded-lg bg-white/50">
                                                        <div className="space-y-2 lg:col-span-1">
                                                            <Label>Preference {hotelSelections.length + 1}</Label>
                                                            <Button 
                                                                type="button" 
                                                                variant="outline" 
                                                                className="w-full justify-start text-left font-normal bg-white"
                                                                onClick={() => {
                                                                    const nextPref = hotelSelections.length + 1;
                                                                    const currentPath = `/explore/package/${id}/reserve`;
                                                                    const districtParam = pkg?.district ? `&district=${encodeURIComponent(pkg.district)}` : "";
                                                                    navigate(`/hotels?mode=select&preference=${nextPref}&returnTo=${encodeURIComponent(currentPath)}${districtParam}`);
                                                                }}
                                                            >
                                                                + {hotelSelections.length > 0 ? "Add Another Hotel" : "Select Hotel"}
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-2 lg:col-span-3 opacity-50 pointer-events-none">
                                                            <Label>Available Rooms</Label>
                                                            <Select disabled><SelectTrigger className="bg-white"><SelectValue placeholder="Select a Room"/></SelectTrigger></Select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Guests
                                        </span>
                                        <span className="font-medium">
                                            {adults} Adults, {children} Children
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2">
                                        <span className="text-muted-foreground">Adults Total</span>
                                        <span className="font-medium">${(adults || 0) * (pkg.basePriceAdult || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-b pb-2">
                                        <span className="text-muted-foreground">Children Total</span>
                                        <span className="font-medium">${(children || 0) * (pkg.basePriceChild || 0)}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-semibold">Estimated Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            ${calculateTotalPrice()}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full gradient-ocean text-white shadow-lg"
                                        size="lg"
                                        disabled={!startDate || submitting}
                                        onClick={handleConfirmReservation}
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        {submitting ? "Confirming..." : "Confirm Reservation"}
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