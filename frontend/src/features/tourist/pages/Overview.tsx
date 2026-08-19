import { useState, useRef, useCallback, memo } from "react";
import { Plane, CheckCircle, Calendar, TrendingUp, ChevronRight, ChevronLeft, Sparkles, Compass } from "lucide-react";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { StatsCard } from "@/features/tourist/components/dashboard/StatsCard";
import { TripCard } from "@/features/tourist/components/dashboard/TripCard";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import { TripDetailsSheet } from "@/features/tourist/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/features/tourist/components/dashboard/ReviewDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { Button } from "@/components/common/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/features/tourist/services/api";
import { useTouristOverview, useActiveDistricts } from "@/features/tourist/hooks/useApi";
import { StatsSkeleton, RecommendationSkeleton } from "@/components/common/ui/skeletons";
import { SriLankaTravelMap } from "@/features/tourist/components/dashboard/SriLankaTravelMap";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

const MemoizedTravelCard = memo(TravelCard);

const Overview = () => {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [targetReviewName, setTargetReviewName] = useState("");
    const [showDriverRating, setShowDriverRating] = useState(false);
    const scrollContainerRef = useRef(null);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [selectedHotelId, setSelectedHotelId] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState("Colombo");

    // Dynamic Active districts hook
    const { data: activeDistricts } = useActiveDistricts();

    // Single aggregated SWR hook (Overview Dashboard: 4 requests -> 1 request)
    const userId = defaultUserId();
    const { data: overview, isLoading: overviewLoading, mutate } = useTouristOverview(userId);

    const stats = overview?.stats ?? { totalTrips: 0, ongoingTrips: 0, completedTrips: 0, upcomingTrips: 0 };
    const trips = overview?.trips ?? [];
    const recommendations = overview?.recommendations ?? [];

    const statsLoading = overviewLoading;
    const tripsLoading = overviewLoading;
    const recsLoading = overviewLoading;

    // Trip -> Filter Trips by Status
    const pendingTrips = trips.filter((t) => t.status?.toLowerCase() === "pending");
    const confirmedTrips = trips.filter(
        (t) =>
            t.status?.toLowerCase() === "confirmed" &&
            t.paymentStatus?.toLowerCase() !== "paid" &&
            !["paid", "refund_requested", "refunded"].includes(t.paymentStatus?.toLowerCase() || "")
    );
    const paidTrips = trips.filter(
        (t) =>
            !["in_progress", "completed", "cancelled"].includes(t.status?.toLowerCase() || "") &&
            (["paid", "refund_requested", "refunded"].includes(t.paymentStatus?.toLowerCase() || "") ||
             ["paid", "refund_requested", "refunded"].includes(t.status?.toLowerCase() || ""))
    );
    const inProgressTrips = trips.filter((t) => t.status?.toLowerCase() === "in_progress");
    const completedTrips = trips.filter((t) => t.status?.toLowerCase() === "completed");
    const cancelledTrips = trips.filter((t) => t.status?.toLowerCase() === "cancelled");

    const handleTripClick = useCallback(async (trip) => {
        const bookingDetail = await api.getBookingById(trip.id);
        setSelectedTrip(bookingDetail);
        setSheetOpen(true);
    }, []);

    const handleReviewClick = useCallback((trip) => {
        setTargetReviewName(trip.destination);
        setShowDriverRating(true);
        setSelectedPackageId(trip.packageId);
        setSelectedHotelId(null);
        setReviewDialogOpen(true);
    }, []);

    const handleHotelReviewClick = useCallback((trip) => {
        if (trip.hotelName) {
            setTargetReviewName(trip.hotelName);
            setShowDriverRating(false);
            setSelectedPackageId(null);
            setSelectedHotelId(trip.hotelId);
            setReviewDialogOpen(true);
        }
    }, []);

    const handleCancelClick = useCallback(async (trip) => {
        if (window.confirm("Cancel Booking?\n\nAre you sure you want to cancel this booking?\nThis action cannot be undone.")) {
            try {
                await api.cancelBooking(trip.id, userId);
                if (mutate) {
                    await mutate();
                }
                alert("Booking cancelled successfully.");
            } catch (err) {
                alert("Failed to cancel booking. Please try again.");
            }
        }
    }, [userId, mutate]);

    const scrollRecommendations = useCallback((direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === "left" ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    }, []);

    const isLoading = statsLoading && tripsLoading;

    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <section className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold">
                            Welcome back! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's what's happening with your travels
                        </p>
                    </div>
                    <Link to="/tourist#all-packages" state={{ scrollTo: "all-packages" }}>
                        <Button className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-md border-0">
                            <Plane className="h-4 w-4 mr-2" />
                            Book New Trip                                                       {/* Booking Button */}
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Stats Grid */}
            {statsLoading ? (
                <StatsSkeleton />
            ) : (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up py-4" style={{ animationDelay: "0.1s" }}>
                    <StatsCard
                        title="Ongoing Trips"                                   // ongoing Trips Card
                        value={stats.ongoingTrips}
                        subtitle="Currently traveling"
                        icon={Plane}
                        variant="blue"                                          //Status Card Colour
                    />
                    <StatsCard
                        title="Completed Trips"                                 //Complete Trips Card
                        value={stats.completedTrips}
                        subtitle="Memories made"
                        icon={CheckCircle}
                        variant="green"

                    />
                    <StatsCard
                        title="Upcoming Bookings"                               //Upcoming Trips Card
                        value={stats.upcomingTrips}
                        subtitle="Adventures await"
                        icon={Calendar}
                        variant="orange"
                    />
                    <StatsCard
                        title="Total Trips"                                     //Total Trips Card
                        value={stats.totalTrips}
                        subtitle="All time"
                        icon={TrendingUp}
                        variant="purple"
                    />
                </section>
            )}

            {/* Trips Management */}
            {/* Filter */}
            <section className="animate-slide-up py-8" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="pending" className="space-y-4">             {/*Pending is default*/}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-green-100 p-2 rounded-2xl border border-green-200 shadow-soft overflow-hidden inline-flex gap-2 overflow-x-auto scrollbar-hide h-auto justify-start max-w-full">
                            <TabsTrigger value="pending" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900">
                                Pending ({pendingTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="confirmed" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900">
                                Confirm ({confirmedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="paid" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-emerald-800 hover:bg-emerald-200/50 hover:text-emerald-900">
                                Paid ({paidTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="in_progress" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900">
                                In Progress ({inProgressTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900">
                                Completed ({completedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="cancelled" className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900">
                                Cancelled ({cancelledTrips.length})
                            </TabsTrigger>
                        </TabsList>
                        <Link to="/tourist/trips">
                            <Button variant="ghost" className="text-primary">
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {/* Display Trips based on Filter */}

                    {/* Pending Trips */}
                    <TabsContent value="pending" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {pendingTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onCancel={() => handleCancelClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {pendingTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No pending trips
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Confirmed Trips */}
                    <TabsContent value="confirmed" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {confirmedTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onCancel={() => handleCancelClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {confirmedTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No confirmed trips
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Paid Trips */}
                    <TabsContent value="paid" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {paidTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {paidTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No paid trips
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* In Progress Trips */}
                    <TabsContent value="in_progress" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {inProgressTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {inProgressTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No trips in progress
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Completed Trips */}
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
                                    No completed trips
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Cancelled Trips */}
                    <TabsContent value="cancelled" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cancelledTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}
                                    onHotelReview={() => handleHotelReviewClick(trip)}
                                />
                            ))}
                            {cancelledTrips.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No cancelled trips
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            {/* Interactive Sri Lanka Travel Map Section */}
            <section className="animate-slide-up py-6" style={{ animationDelay: "0.35s" }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Compass className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Interactive Sri Lanka Map</h2>
                        <p className="text-muted-foreground text-sm">Explore travel packages by geographical district</p>
                    </div>
                </div>
                <SriLankaTravelMap
                    selectedDistrict={selectedDistrict}
                    onSelectDistrict={setSelectedDistrict}
                    districtsWithPackages={activeDistricts || []}
                />
            </section>

            {/* Recommendations Section */}
            {(recsLoading || recommendations.length > 0) && (
                <section className="animate-slide-up py-8" style={{ animationDelay: "0.4s" }}>
                    <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-accent" />
                        <h2 className="text-xl font-semibold">Recommended for You</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => scrollRecommendations("left")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => scrollRecommendations("right")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {recsLoading ? (
                    <RecommendationSkeleton count={5} />
                ) : (
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="w-72 flex-shrink-0 flex">
                                <MemoizedTravelCard
                                    recommendation={rec}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>
                )}
                </section>
            )}

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
                onSuccess={() => { }}
            />
        </DashboardLayout>
    );
};

export default Overview;