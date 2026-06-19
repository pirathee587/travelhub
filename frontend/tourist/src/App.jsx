import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";


// ── Lazy-loaded pages ────────────────────────────────
// Only the initial route (Explore) is eagerly loaded.
// All other pages load on-demand when the user navigates.
import Explore from "./pages/Explore";

const Overview = lazy(() => import("./pages/Overview"));
const MyTrips = lazy(() => import("./pages/MyTrips"));
const Documents = lazy(() => import("./pages/Documents"));
const PackageDetails = lazy(() => import("./pages/PackageDetails"));
const PackageReservation = lazy(() => import("./pages/PackageReservation"));
const Hotel = lazy(() => import("./pages/Hotel"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal fallback while chunks load (sub-second)
const PageFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Suspense fallback={<PageFallback />}>
                    <Routes>
                        <Route path="/" element={<Explore />} />
                        <Route path="/overview" element={<Overview />} />
                        <Route path="/trips" element={<MyTrips />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/explore/package/:id" element={<PackageDetails />} />
                        <Route path="/explore/package/:id/reserve" element={<PackageReservation />} />
                        <Route path="/hotels" element={<Hotel />} />
                        <Route path="/hotels/:id" element={<HotelDetails />} />
                        <Route path="/settings" element={<Settings />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
