import { useState, useEffect, useRef } from "react";
import { Plane, CheckCircle, Calendar, TrendingUp, ChevronRight, ChevronLeft, Sparkles,} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TripCard } from "@/components/dashboard/TripCard";
import { TravelCard } from "@/components/dashboard/TravelCard";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { TripDetailsSheet } from "@/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/components/dashboard/ReviewDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/services/api";

const Overview = () => {
    const [trips, setTrips] = useState([]);
    const [stats, setStats] = useState({
        totalTrips: 0,
        ongoingTrips: 0,
        completedTrips: 0,
        upcomingTrips: 0,
    });
    const [recentDocs, setRecentDocs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [targetReviewName, setTargetReviewName] = useState("");
    const [showDriverRating, setShowDriverRating] = useState(false);
    const scrollContainerRef = useRef(null);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    const [selectedHotelId, setSelectedHotelId] = useState(null);

    useEffect(() => {
        Promise.all([
            api.getStats(1),
            api.getTrips(1),
            api.getDocuments(1),
            api.getRecommendations(1),
        ]).then(([statsData, tripsData, docsData, recsData]) => {
            setStats(statsData || {});
            setTrips(Array.isArray(tripsData) ? tripsData : []);
            setRecentDocs(Array.isArray(docsData) ? docsData.slice(0, 4) : []);
            setRecommendations(Array.isArray(recsData) ? recsData : []);
            setLoading(false);
        }).catch(() => {
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

    const handleReviewClick = (trip) => {
        setTargetReviewName(trip.destination);
        setShowDriverRating(true);
        setSelectedPackageId(trip.packageId);
        setSelectedHotelId(null);
        setReviewDialogOpen(true);
    };

    const handleHotelReviewClick = (trip) => {
        if (trip.hotelName) {
            setTargetReviewName(trip.hotelName);
            setShowDriverRating(false);
            setSelectedPackageId(null);
            setSelectedHotelId(trip.hotelId);
            setReviewDialogOpen(true);
        }
    };

    const scrollRecommendations = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === "left" ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <DashboardLayout showSearch={false}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout showSearch={false}>
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
                    <Link to="/">
                        <Button className="gradient-sunset shadow-card text-accent-foreground">
                            <Plane className="h-4 w-4 mr-2" />
                            Book New Trip
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <StatsCard
                    title="Ongoing Trips"
                    value={stats.ongoingTrips}
                    subtitle="Currently traveling"
                    icon={Plane}
                    variant="primary"
                />
                <StatsCard
                    title="Completed Trips"
                    value={stats.completedTrips}
                    subtitle="Memories made"
                    icon={CheckCircle}
                    trend={{ value: 25, isPositive: true }}
                />
                <StatsCard
                    title="Upcoming Bookings"
                    value={stats.upcomingTrips}
                    subtitle="Adventures await"
                    icon={Calendar}
                    variant="accent"
                />
                <StatsCard
                    title="Total Trips"
                    value={stats.totalTrips}
                    subtitle="All time"
                    icon={TrendingUp}
                />
            </section>

            {/* Trips Management */}
            <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="ongoing" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-secondary">
                            <TabsTrigger value="ongoing" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                Ongoing & Upcoming
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-card data-[state=active]:shadow-soft">
                                Completed
                            </TabsTrigger>
                        </TabsList>
                        <Link to="/trips">
                            <Button variant="ghost" className="text-primary">
                                View All
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </div>

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
                                    No ongoing trips
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
                                    No completed trips
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </section>

            {/* Documents Section */}
            <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Documents</h2>
                    <Link to="/documents">
                        <Button variant="ghost" className="text-primary">
                            All Documents
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
            <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
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
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {recommendations.map((rec) => (
                        <TravelCard
                            key={rec.id}
                            recommendation={rec}
                        />
                    ))}
                </div>
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