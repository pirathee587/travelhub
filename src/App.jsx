import { Toaster } from "@tourist/components/ui/toaster";
import { Toaster as Sonner } from "@tourist/components/ui/sonner";
import { TooltipProvider } from "@tourist/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import { AuthProvider } from "@shared/auth/AuthContext";
import RoleSelect from "@shared/auth/RoleSelect";

// ── Tourist pages (lazy-loaded) ──────────────────────
import Explore from "@tourist/pages/Explore";
const Overview = lazy(() => import("@tourist/pages/Overview"));
const MyTrips = lazy(() => import("@tourist/pages/MyTrips"));
const Documents = lazy(() => import("@tourist/pages/Documents"));
const TouristPackageDetails = lazy(() => import("@tourist/pages/PackageDetails"));
const PackageReservation = lazy(() => import("@tourist/pages/PackageReservation"));
const Hotel = lazy(() => import("@tourist/pages/Hotel"));
const HotelDetails = lazy(() => import("@tourist/pages/HotelDetails"));
const Agents = lazy(() => import("@tourist/pages/Agents"));
const AgentDetails = lazy(() => import("@tourist/pages/AgentDetails"));
const TouristSettings = lazy(() => import("@tourist/pages/Settings"));
const TouristNotFound = lazy(() => import("@tourist/pages/NotFound"));

// ── Agent pages (lazy-loaded) ────────────────────────
const AgentIndex = lazy(() => import("@agent/pages/Index"));
const Vehicles = lazy(() => import("@agent/pages/Vehicles"));
const Bookings = lazy(() => import("@agent/pages/Bookings"));
const BookingDetails = lazy(() => import("@agent/pages/BookingDetails"));
const Packages = lazy(() => import("@agent/pages/Packages"));
const AgentPackageDetails = lazy(() => import("@agent/pages/PackageDetails"));
const Analytics = lazy(() => import("@agent/pages/Analytics"));
const Profile = lazy(() => import("@agent/pages/Profile"));
const AgentSettings = lazy(() => import("@agent/pages/Settings"));
const AgentNotFound = lazy(() => import("@agent/pages/NotFound"));

// ── Admin pages (lazy-loaded) ────────────────────────
const Dashboard = lazy(() => import("@admin/pages/Dashboard"));
const AgentApprovals = lazy(() => import("@admin/pages/AgentApprovals"));
const HotelApprovals = lazy(() => import("@admin/pages/HotelApprovals"));
const PackageApprovals = lazy(() => import("@admin/pages/PackageApprovals"));
const AdminPayments = lazy(() => import("@admin/pages/Payments"));
const AdminAnalytics = lazy(() => import("@admin/pages/Analytics"));
const Users = lazy(() => import("@admin/pages/Users"));
const AdminAgentDetails = lazy(() => import("@admin/pages/AgentDetails"));
const AdminHotelDetails = lazy(() => import("@admin/pages/HotelDetails"));
const AdminPackageDetails = lazy(() => import("@admin/pages/PackageDetails"));
const AdminLayout = lazy(() => import("@admin/components/Layout"));
const AdminModalProvider = lazy(() => import("@admin/components/ModalContext"));

const queryClient = new QueryClient();

// Minimal fallback while chunks load (sub-second)
const PageFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
);

function AppRoutes() {
    return (
        <Suspense fallback={<PageFallback />}>
            <Routes>
                {/* ── Role picker (landing page) ─────────────── */}
                <Route path="/" element={<RoleSelect />} />

                {/* ── Tourist routes ─────────────────────────── */}
                <Route path="/tourist" element={<Explore />} />
                <Route path="/tourist/overview" element={<Overview />} />
                <Route path="/tourist/trips" element={<MyTrips />} />
                <Route path="/tourist/documents" element={<Documents />} />
                <Route path="/tourist/explore" element={<Explore />} />
                <Route path="/tourist/explore/package/:id" element={<TouristPackageDetails />} />
                <Route path="/tourist/explore/package/:id/reserve" element={<PackageReservation />} />
                <Route path="/tourist/hotels" element={<Hotel />} />
                <Route path="/tourist/hotels/:id" element={<HotelDetails />} />
                <Route path="/tourist/agents" element={<Agents />} />
                <Route path="/tourist/agents/:id" element={<AgentDetails />} />
                <Route path="/tourist/settings" element={<TouristSettings />} />
                <Route path="/tourist/*" element={<TouristNotFound />} />

                {/* ── Agent routes ───────────────────────────── */}
                <Route path="/agent" element={<AgentIndex />} />
                <Route path="/agent/vehicles" element={<Vehicles />} />
                <Route path="/agent/bookings" element={<Bookings />} />
                <Route path="/agent/bookings/:id" element={<BookingDetails />} />
                <Route path="/agent/packages" element={<Packages />} />
                <Route path="/agent/packages/:id" element={<AgentPackageDetails />} />
                <Route path="/agent/analytics" element={<Analytics />} />
                <Route path="/agent/profile" element={<Profile />} />
                <Route path="/agent/settings" element={<AgentSettings />} />
                <Route path="/agent/*" element={<AgentNotFound />} />

                {/* ── Admin routes ───────────────────────────── */}
                <Route
                    path="/admin/*"
                    element={
                        <AdminModalProvider>
                            <Routes>
                                <Route element={<AdminLayout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route path="agents" element={<AgentApprovals />} />
                                    <Route path="agents/:id" element={<AdminAgentDetails />} />
                                    <Route path="hotels" element={<HotelApprovals />} />
                                    <Route path="hotels/:id" element={<AdminHotelDetails />} />
                                    <Route path="packages" element={<PackageApprovals />} />
                                    <Route path="packages/:id" element={<AdminPackageDetails />} />
                                    <Route path="payments" element={<AdminPayments />} />
                                    <Route path="analytics" element={<AdminAnalytics />} />
                                    <Route path="users" element={<Users />} />
                                </Route>
                            </Routes>
                        </AdminModalProvider>
                    }
                />
            </Routes>
        </Suspense>
    );
}

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
