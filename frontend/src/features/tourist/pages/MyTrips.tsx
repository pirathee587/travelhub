import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/features/tourist/components/dashboard/DashboardLayout";
import { TripCard } from "@/features/tourist/components/dashboard/TripCard";
import { TripDetailsSheet } from "@/features/tourist/components/dashboard/TripDetailsSheet";
import { ReviewDialog } from "@/features/tourist/components/dashboard/ReviewDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/ui/tabs";
import { Button } from "@/components/common/ui/button";
import { Map, Plane } from "lucide-react";
import { MyTripsSkeleton, TripListSkeleton } from "@/components/common/ui/skeletons";
import { api } from "@/features/tourist/services/api";
import { defaultUserId } from "@/features/tourist/services/userHelpers";

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
        api.getTrips(defaultUserId())
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

    const pendingTrips = trips.filter((t) => t.status?.toLowerCase() === "pending");           //Pending
    const confirmedTrips = trips.filter((t) => 
        ["confirmed", "paid", "refund_requested", "refunded"].includes(t.status?.toLowerCase())
    );       //Confirmed
    const inProgressTrips = trips.filter((t) => t.status?.toLowerCase() === "in_progress");   //In Progress
    const completedTrips = trips.filter((t) => t.status?.toLowerCase() === "completed");      //Completed
    const cancelledTrips = trips.filter((t) => t.status?.toLowerCase() === "cancelled");        //Cancelled

    const handleTripClick = async (trip) => {
        const bookingDetail = await api.getBookingById(trip.id);
        setSelectedTrip(bookingDetail);
        setSheetOpen(true);
        };

    const handleCancelClick = async (trip) => {
        if (window.confirm("Cancel Booking?\n\nAre you sure you want to cancel this booking?\nThis action cannot be undone.")) {
            try {
                await api.cancelBooking(trip.id, defaultUserId());
                // Update local state to move trip to 'cancelled'
                setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, status: "cancelled" } : t));
                alert("Booking cancelled successfully.");
            } catch (err) {
                alert("Failed to cancel booking. Please try again.");
            }
        }
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
            <DashboardLayout>
                <MyTripsSkeleton />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Page Header */}
            <section className="animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center">
                            <Map className="h-6 w-6 text-black"  />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold">My Trips </h1>
                            <p className="text-muted-foreground">
                                Manage and view all your travel adventures
                            </p>
                        </div>
                    </div>
                    <Link to="/tourist">
                        <Button className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-md border-0">
                            <Plane className="h-4 w-4 mr-2" />
                            Plan New Trip                                   {/* Booking Button */}
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Trips Tabs */}
            <section className="animate-slide-up py-8" style={{ animationDelay: "0.2s" }}>
                <Tabs defaultValue="pending" className="space-y-4">
                    <TabsList className="bg-green-100 p-2 rounded-2xl border border-green-200 shadow-soft overflow-hidden inline-flex gap-2 overflow-x-auto scrollbar-hide h-auto justify-start max-w-full">
                        <TabsTrigger                    //Pending tab to show pending trips
                            value="pending"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900" 
                        >
                            Pending ({pendingTrips.length})
                        </TabsTrigger>
                        <TabsTrigger                    //Confirmed tab to show confirmed trips
                            value="confirmed"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900"
                        >
                            Confirmed ({confirmedTrips.length})
                        </TabsTrigger>
                        <TabsTrigger                    //Paid tab to show paid trips
                            value="paid"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-emerald-800 hover:bg-emerald-200/50 hover:text-emerald-900"
                        >
                            Paid ({paidTrips.length})
                        </TabsTrigger>
                        <TabsTrigger                    //In Progress tab to show in progress trips
                            value="in_progress"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900"
                        >
                            In Progress ({inProgressTrips.length})
                        </TabsTrigger>
                        <TabsTrigger                    //Completed tab to show completed trips
                            value="completed"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900"
                        >
                            Completed ({completedTrips.length})
                        </TabsTrigger>
                        <TabsTrigger                    //Cancelled tab to show cancelled trips
                            value="cancelled"
                            className="h-11 px-6 rounded-xl transition-all duration-300 flex-shrink-0 font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-glow data-[state=active]:scale-105 text-green-800 hover:bg-green-200/50 hover:text-green-900"
                        >
                            Cancelled ({cancelledTrips.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Trip card mapping*/}
                    <TabsContent value="pending" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {pendingTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onCancel={() => handleCancelClick(trip)}
                                    onReview={() => handleReviewClick(trip)}  //Pending trips tab content
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

                    <TabsContent value="confirmed" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {confirmedTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}    //Confirmed trips tab content   
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

                    <TabsContent value="in_progress" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {inProgressTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}    //In Progress trips tab content   
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

                    <TabsContent value="completed" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {completedTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}    //Completed trips tab content   
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

                    <TabsContent value="cancelled" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {cancelledTrips.map((trip) => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    onClick={() => handleTripClick(trip)}
                                    onReview={() => handleReviewClick(trip)}    //Cancelled trips tab content
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