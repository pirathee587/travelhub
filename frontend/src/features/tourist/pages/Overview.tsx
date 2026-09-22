import { useState, useRef, useCallback, useMemo, memo } from "react";
import {
    Plane,
    CheckCircle,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Compass,
    MapPin,
    Clock,
    CreditCard,
    Activity,
    Luggage,
} from "lucide-react";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { StatsCard } from "@/features/tourist/components/dashboard/StatsCard";
import { TripCard } from "@/features/tourist/components/dashboard/TripCard";
import { TravelCard } from "@/features/tourist/components/dashboard/TravelCard";
import { TripDetailsSheet } from "@/features/tourist/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/features/tourist/components/dashboard/ReviewDialog";
import { BookingCalendar } from "@/features/tourist/components/dashboard/BookingCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { Button } from "@/components/common/ui/button";
import { Badge } from "@/components/common/ui/badge";
import { Link } from "react-router-dom";
import { api } from "@/features/tourist/services/api";
import { useTouristOverview, useActiveDistricts } from "@/features/tourist/hooks/useApi";
import { StatsSkeleton, RecommendationSkeleton } from "@/components/common/ui/skeletons";
import { SriLankaTravelMap } from "@/features/tourist/components/dashboard/SriLankaTravelMap";
import { defaultUserId } from "@/features/tourist/services/userHelpers";
import { cn } from "@/features/tourist/services/utils";

const MemoizedTravelCard: any = memo(TravelCard);

const Overview = () => {
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [targetReviewName, setTargetReviewName] = useState("");
    const [showDriverRating, setShowDriverRating] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState("Colombo");

    // Dynamic Active districts hook
    const { data: activeDistricts } = useActiveDistricts();

    // Single aggregated SWR hook
    const userId = defaultUserId();
    const { data: overview, isLoading: overviewLoading, mutate } = useTouristOverview(userId);

    const stats = overview?.stats ?? { totalTrips: 0, ongoingTrips: 0, completedTrips: 0, upcomingTrips: 0 };
    const trips = overview?.trips ?? [];
    const recommendations = overview?.recommendations ?? [];

    const statsLoading = overviewLoading;
    const recsLoading = overviewLoading;

    // Filter Trips by Status
    const pendingTrips = useMemo(
        () => trips.filter((t: any) => t.status?.toLowerCase() === "pending"),
        [trips]
    );
    const confirmedTrips = useMemo(
        () =>
            trips.filter(
                (t: any) =>
                    t.status?.toLowerCase() === "confirmed" &&
                    t.paymentStatus?.toLowerCase() !== "paid" &&
                    !["paid", "refund_requested", "refunded"].includes(t.paymentStatus?.toLowerCase() || "")
            ),
        [trips]
    );
    const paidTrips = useMemo(
        () =>
            trips.filter(
                (t: any) =>
                    !["in_progress", "completed", "cancelled"].includes(t.status?.toLowerCase() || "") &&
                    (["paid", "refund_requested", "refunded"].includes(t.paymentStatus?.toLowerCase() || "") ||
                        ["paid", "refund_requested", "refunded"].includes(t.status?.toLowerCase() || ""))
            ),
        [trips]
    );
    const inProgressTrips = useMemo(
        () => trips.filter((t: any) => t.status?.toLowerCase() === "in_progress"),
        [trips]
    );
    const completedTrips = useMemo(
        () => trips.filter((t: any) => t.status?.toLowerCase() === "completed"),
        [trips]
    );
    const cancelledTrips = useMemo(
        () => trips.filter((t: any) => t.status?.toLowerCase() === "cancelled"),
        [trips]
    );

    // Calculate unique districts visited
    const districtsVisited = useMemo(() => {
        const set = new Set<string>();
        trips.forEach((t: any) => {
            if (t.district) set.add(t.district);
            else if (t.destination) set.add(t.destination);
        });
        return set.size;
    }, [trips]);

    // Construct recent activities timeline
    const recentActivities = useMemo(() => {
        if (!trips || trips.length === 0) return [];
        return trips.slice(0, 4).map((trip: any) => {
            const isPaid = ["paid", "refund_requested", "refunded"].includes(
                trip.paymentStatus?.toLowerCase() || ""
            );
            const status = trip.status?.toLowerCase();
            let title = "Reservation Pending";
            let desc = `Booking placed for ${trip.packageName || trip.destination || "package"}`;
            let icon = Clock;
            let badgeClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300";
            let badgeText = "Pending";

            if (status === "completed") {
                title = "Trip Completed";
                desc = `Finished memorable tour in ${trip.district || trip.destination || "Sri Lanka"}`;
                icon = CheckCircle;
                badgeClass = "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
                badgeText = "Completed";
            } else if (status === "in_progress") {
                title = "Tour in Progress";
                desc = `Currently exploring ${trip.destination || trip.district}`;
                icon = Plane;
                badgeClass = "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300";
                badgeText = "In Progress";
            } else if (isPaid) {
                title = "Payment Completed";
                desc = `Payment confirmed for ${trip.packageName || trip.destination}`;
                icon = CreditCard;
                badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300";
                badgeText = "Paid";
            } else if (status === "confirmed") {
                title = "Booking Confirmed";
                desc = `Reservation verified for ${trip.packageName || trip.destination}`;
                icon = CheckCircle;
                badgeClass = "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300";
                badgeText = "Confirmed";
            }

            return {
                id: trip.id,
                title,
                desc,
                date: trip.startDate || "Upcoming",
                icon,
                badgeClass,
                badgeText,
                trip,
            };
        });
    }, [trips]);

    const handleTripClick = useCallback(async (trip: any) => {
        const bookingDetail = await api.getBookingById(trip.id);
        setSelectedTrip(bookingDetail);
        setSheetOpen(true);
    }, []);

    const handleReviewClick = useCallback((trip: any) => {
        setTargetReviewName(trip.destination);
        setShowDriverRating(true);
        setSelectedPackageId(trip.packageId);
        setSelectedHotelId(null);
        setReviewDialogOpen(true);
    }, []);

    const handleHotelReviewClick = useCallback((trip: any) => {
        if (trip.hotelName) {
            setTargetReviewName(trip.hotelName);
            setShowDriverRating(false);
            setSelectedPackageId(null);
            setSelectedHotelId(trip.hotelId);
            setReviewDialogOpen(true);
        }
    }, []);

    const handleCancelClick = useCallback(
        async (trip: any) => {
            if (
                window.confirm(
                    "Cancel Booking?\n\nAre you sure you want to cancel this booking?\nThis action cannot be undone."
                )
            ) {
                try {
                    await api.cancelBooking(trip.id, userId!);
                    if (mutate) {
                        await mutate();
                    }
                    alert("Booking cancelled successfully.");
                } catch (err) {
                    alert("Failed to cancel booking. Please try again.");
                }
            }
        },
        [userId, mutate]
    );

    const scrollRecommendations = useCallback((direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === "left" ? -340 : 340;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8 sm:space-y-10 pb-12">
                {/* ─── Hero Section ──────────────────────────────────────────────── */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 border border-border/70 shadow-soft">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative z-10">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-1">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Tourist Portal · TravelHub Sri Lanka</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                                Welcome back! 👋
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                                Manage your itineraries, explore districts on the interactive map, and keep track of your upcoming island holidays.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                            <Link to="/tourist#all-packages" state={{ scrollTo: "all-packages" }}>
                                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all rounded-2xl h-11 px-5 font-semibold gap-2 border-0">
                                    <Plane className="h-4 w-4" />
                                    Book New Trip
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── Stats Grid ────────────────────────────────────────────────── */}
                {statsLoading ? (
                    <StatsSkeleton />
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <StatsCard
                            title="Upcoming Bookings"
                            value={stats.upcomingTrips}
                            subtitle="Planned departures"
                            icon={Calendar}
                            variant="orange"
                        />
                        <StatsCard
                            title="Ongoing Trips"
                            value={stats.ongoingTrips}
                            subtitle="Currently on journey"
                            icon={Plane}
                            variant="blue"
                        />
                        <StatsCard
                            title="Completed Trips"
                            value={stats.completedTrips}
                            subtitle="Memories collected"
                            icon={CheckCircle}
                            variant="green"
                        />
                        <StatsCard
                            title="Districts Visited"
                            value={districtsVisited}
                            subtitle="Out of 25 districts"
                            icon={MapPin}
                            variant="purple"
                        />
                    </section>
                )}

                {/* ─── Trips Management Section ──────────────────────────────────── */}
                <section className="space-y-4">
                    <Tabs defaultValue="pending" className="space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Your Bookings
                                </h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Filter and view the status of all your travel packages
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link to="/tourist/trips">
                                    <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/10 rounded-xl gap-1">
                                        View All Trips
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Modern Segmented Control Filter Tabs */}
                        <TabsList className="bg-muted/60 p-1.5 rounded-2xl border border-border/60 shadow-xs inline-flex gap-1 overflow-x-auto scrollbar-hide h-auto justify-start max-w-full">
                            <TabsTrigger
                                value="pending"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                Pending ({pendingTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="confirmed"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                Confirmed ({confirmedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="paid"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                Paid ({paidTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="in_progress"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                In Progress ({inProgressTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="completed"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                Completed ({completedTrips.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="cancelled"
                                className="h-9 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground shrink-0"
                            >
                                Cancelled ({cancelledTrips.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Display Filtered Cards */}
                        <TabsContent value="pending" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {pendingTrips.map((trip: any) => (
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
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <Luggage className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-foreground">No pending trips</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            When you book a package, it will appear here while awaiting agency approval.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="confirmed" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {confirmedTrips.map((trip: any) => (
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
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <CheckCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-foreground">No confirmed trips</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Trips approved by travel agencies ready for payment will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="paid" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {paidTrips.map((trip: any) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onClick={() => handleTripClick(trip)}
                                        onReview={() => handleReviewClick(trip)}
                                        onHotelReview={() => handleHotelReviewClick(trip)}
                                    />
                                ))}
                                {paidTrips.length === 0 && (
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-foreground">No paid trips</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Fully paid adventures ready for your travel date will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="in_progress" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {inProgressTrips.map((trip: any) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onClick={() => handleTripClick(trip)}
                                        onReview={() => handleReviewClick(trip)}
                                        onHotelReview={() => handleHotelReviewClick(trip)}
                                    />
                                ))}
                                {inProgressTrips.length === 0 && (
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <Plane className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-foreground">No trips currently in progress</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Your active vacation journeys underway will be shown here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="completed" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {completedTrips.map((trip: any) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onClick={() => handleTripClick(trip)}
                                        onReview={() => handleReviewClick(trip)}
                                        onHotelReview={() => handleHotelReviewClick(trip)}
                                    />
                                ))}
                                {completedTrips.length === 0 && (
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-foreground">No completed trips yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Concluded tours with review options will appear in this section.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="cancelled" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {cancelledTrips.map((trip: any) => (
                                    <TripCard
                                        key={trip.id}
                                        trip={trip}
                                        onClick={() => handleTripClick(trip)}
                                        onReview={() => handleReviewClick(trip)}
                                        onHotelReview={() => handleHotelReviewClick(trip)}
                                    />
                                ))}
                                {cancelledTrips.length === 0 && (
                                    <div className="col-span-full py-12 px-4 text-center rounded-2xl border border-dashed border-border/70 bg-card/40">
                                        <p className="text-sm font-semibold text-foreground">No cancelled trips</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>

                {/* ─── Interactive Booking Calendar Section ────────────────────── */}
                <section className="pt-2">
                    <BookingCalendar
                        trips={trips}
                        isLoading={overviewLoading}
                        onOpenTripDetails={handleTripClick}
                    />
                </section>

                {/* ─── Recent Activity Timeline & Map Row ──────────────────────── */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Recent Activity Feed (4 cols on desktop) */}
                    <div className="lg:col-span-4 rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-soft space-y-4">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
                                    <p className="text-xs text-muted-foreground">Booking &amp; status milestones</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-1">
                            {recentActivities.map((activity: any, idx: number) => {
                                const IconComponent = activity.icon;
                                return (
                                    <div
                                        key={activity.id || idx}
                                        className="relative pl-6 pb-2 last:pb-0 group cursor-pointer"
                                        onClick={() => handleTripClick(activity.trip)}
                                    >
                                        {/* Connector line */}
                                        {idx !== recentActivities.length - 1 && (
                                            <div className="absolute left-2.5 top-6 bottom-0 w-px bg-border/60" />
                                        )}

                                        {/* Timeline bullet icon */}
                                        <div className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center group-hover:border-primary transition-colors">
                                            <IconComponent className="h-2.5 w-2.5 text-primary" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                                    {activity.title}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-[10px] px-1.5 py-0 rounded-full font-medium shrink-0", activity.badgeClass)}
                                                >
                                                    {activity.badgeText}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {activity.desc}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{activity.date}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {recentActivities.length === 0 && (
                                <div className="py-8 text-center text-xs text-muted-foreground">
                                    No activity recorded yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sri Lanka Travel Map (8 cols on desktop) */}
                    <div className="lg:col-span-8 rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-soft space-y-4">
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Compass className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Interactive Sri Lanka Map</h3>
                                    <p className="text-xs text-muted-foreground">Tap any district to reveal top rated packages</p>
                                </div>
                            </div>
                        </div>

                        <SriLankaTravelMap
                            selectedDistrict={selectedDistrict}
                            onSelectDistrict={setSelectedDistrict}
                            districtsWithPackages={activeDistricts || []}
                        />
                    </div>
                </section>

                {/* ─── Recommended Packages Section ──────────────────────────────── */}
                {(recsLoading || recommendations.length > 0) && (
                    <section className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                        Recommended for You
                                    </h2>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        Curated destinations &amp; exclusive Sri Lankan holiday packages
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl border-border/70 hover:bg-muted"
                                    onClick={() => scrollRecommendations("left")}
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl border-border/70 hover:bg-muted"
                                    onClick={() => scrollRecommendations("right")}
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {recsLoading ? (
                            <RecommendationSkeleton count={4} />
                        ) : (
                            <div
                                ref={scrollContainerRef}
                                className="flex gap-5 overflow-x-auto pb-4 pt-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {recommendations.map((rec: any) => (
                                    <div key={rec.id} className="w-72 sm:w-80 flex-shrink-0 flex snap-start">
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
            </div>

            {/* Modal details and reviews */}
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