import { useState, useRef, useCallback, memo } from "react";
import { Plane, CheckCircle, Calendar, TrendingUp, ChevronRight, ChevronLeft, Sparkles, } from "lucide-react";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { StatsCard } from "@/features/tourist/components/dashboard/StatsCard";
import { TripCard } from "@/features/tourist/components/dashboard/TripCard";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import { DocumentCard } from "@/features/tourist/components/dashboard/DocumentCard";
import { TripDetailsSheet } from "@/features/tourist/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/features/tourist/components/dashboard/ReviewDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { Button } from "@/components/common/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/features/tourist/services/api";
import { useStats, useTrips, useDocuments, useRecommendations } from "@/features/tourist/hooks/useApi";
import { StatsSkeleton, RecommendationSkeleton } from "@/components/common/ui/skeletons";
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

    // SWR hooks — parallel fetching with caching
    const userId = defaultUserId();
    const { data: stats = { totalTrips: 0, ongoingTrips: 0, completedTrips: 0, upcomingTrips: 0 }, isLoading: statsLoading } = useStats(userId);
    const { data: trips = [], isLoading: tripsLoading } = useTrips(userId);
    const { data: allDocs = [] } = useDocuments(userId);
    const { data: recommendations = [], isLoading: recsLoading } = useRecommendations(userId);

    const recentDocs = allDocs.slice(0, 4);

    // Trip -> Filter Trips by Status
    const pendingTrips = trips.filter((t) => t.status === "pending"); {/* Pending Trips */ }
    const confirmedTrips = trips.filter((t) => t.status === "confirmed"); {/* Confirmed Trips */ }
    const inProgressTrips = trips.filter((t) => t.status === "in_progress"); {/* In Progress Trips */ }
    const completedTrips = trips.filter((t) => t.status === "completed"); {/* Completed Trips */ }
    const cancelledTrips = trips.filter((t) => t.status === "cancelled"); {/* Cancelled Trips */ }

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
                    <Link to="/tourist">
                        <Button className="gradient-sunset shadow-card text-accent-foreground">
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
                        <TabsList className="bg-secondary grid grid-cols-5 gap-1 w-full max-w-2xl">
                            <TabsTrigger value="pending" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                Pending ({pendingTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="confirmed" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                Confirm ({confirmedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="in_progress" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                In Progress ({inProgressTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                Completed ({completedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger value="cancelled" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
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

            {/* Documents Section */}
            <section className="animate-slide-up py-8" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Documents</h2>
                    <Link to="/tourist/documents">
                        <Button variant="ghost" className="text-primary">
                            All Documents
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">         {/* Documents */}
                    {recentDocs.map((doc, index) => (
                        <DocumentCard
                            key={index}
                            title={doc.title}
                            type={doc.docType}
                            date={new Date(doc.createdAt).toLocaleDateString()}
                            size={doc.fileSize}
                        />
                    ))}
                </div>
            </section>

            {/* Recommendations Section */}
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