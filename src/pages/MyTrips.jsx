import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TripCard } from "@/components/dashboard/TripCard";
import { TripDetailsSheet } from "@/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/components/dashboard/ReviewDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Map, Plane } from "lucide-react";
import { api } from "@/services/api";

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [targetReviewName, setTargetReviewName] = useState("");
    const [showDriverRating, setShowDriverRating] = useState(false);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [selectedHotelId, setSelectedHotelId] = useState(null);

    useEffect(() => {
        api.getTrips(1)
            .then(async (data) => {
                const tripsData = Array.isArray(data) ? data : [];
                const tripsWithHotelInfo = await Promise.all(
                    tripsData.map(async (trip) => {
                        if (trip.status !== "completed" || (trip.hotelId != null && trip.hotelName)) {
                            return trip;
                        }

                        try {
                            const bookingDetail = await api.getBookingById(trip.id);
                            return {
                                ...trip,
                                hotelId: bookingDetail?.hotelId ?? trip.hotelId ?? null,
                                hotelName: bookingDetail?.hotelName ?? trip.hotelName ?? null,
                            };
                        } catch {
                            return trip;
                        }
                    })
                );

                setTrips(tripsWithHotelInfo);
                setLoading(false);
            })
            .catch(() => {
                setTrips([]);
                setLoading(false);
            });
    }, []);

    const ongoingTrips = trips.filter(
        (t) => t.status === "in_progress" || t.status === "confirmed"
    );
    const completedTrips = trips.filter((t) => t.status === "completed");

    const handleTripClick = async (trip) => {
        const bookingDetail = await api.getBookingById(trip.id);
        setSelectedTrip(bookingDetail);
        setSheetOpen(true);
        };

    const handleReviewSuccess = () => {
        // Clear the selected states
        setSelectedPackageId(null);
        setSelectedHotelId(null);
        setTargetReviewName("");
        // Optionally refresh trips list
        // api.getTrips(1).then(data => setTrips(data));
    };

    const handleReviewClick = (trip) => {
        setTargetReviewName(trip.destination);
        setShowDriverRating(true);
        setSelectedPackageId(trip.packageId);
        setSelectedHotelId(null);
        setReviewDialogOpen(true);
    };

    const handleHotelReviewClick = (trip) => {
    if (trip.hotelId != null || trip.hotelName) {
        setTargetReviewName(trip.hotelName || "Hotel");
        setShowDriverRating(false);
        setSelectedPackageId(null);
        setSelectedHotelId(trip.hotelId);
        setReviewDialogOpen(true);
    }
    };

    if (loading) {
        return (
            <DashboardLayout showSearch={false}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading trips...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout showSearch={false}>
            {/* Page Header */}
            <section className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl gradient-ocean flex items-center justify-center shadow-glow">
                            <Map className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">My Trips</h1>
                            <p className="text-muted-foreground">
                                Manage and view all your travel adventures
                            </p>
                        </div>
                    </div>
                    <Link to="/">
                        <Button className="gradient-sunset shadow-card text-accent-foreground">
                            <Plane className="h-4 w-4 mr-2" />
                            Plan New Trip
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Trips Tabs */}
            <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="ongoing" className="space-y-4">
                    <TabsList className="bg-secondary">
                        <TabsTrigger
                            value="ongoing"
                            className="data-[state=active]:bg-card data-[state=active]:shadow-soft"
                        >
                            Ongoing & Upcoming ({ongoingTrips.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="data-[state=active]:bg-card data-[state=active]:shadow-soft"
                        >
                            Completed ({completedTrips.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-card data-[state=active]:shadow-soft"
                        >
                            All Trips ({trips.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ongoing" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {ongoingTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {ongoingTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No ongoing trips found
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="completed" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {completedTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {completedTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No completed trips found
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="all" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {trips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {trips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No trips found
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            <TripDetailsSheet
                trip={selectedTrip}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />

            <ReviewDialog
                open={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                targetName={targetReviewName}
                showDriverRating={showDriverRating}
                packageId={selectedPackageId}
                hotelId={selectedHotelId}
                onSuccess={handleReviewSuccess}
            />
        </DashboardLayout>
    );
};

export default MyTrips;