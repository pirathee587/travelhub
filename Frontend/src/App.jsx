import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import MyTrips from "./pages/MyTrips";
import Documents from "./pages/Documents";
import Explore from "./pages/Explore";
import PackageDetails from "./pages/PackageDetails";
import PackageReservation from "./pages/PackageReservation";
import Hotel from "./pages/Hotel";
import HotelDetails from "./pages/HotelDetails";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HotelDashboard from "./pages/teammate-dashboards/HotelDashboard";
import AgentDashboard from "./pages/teammate-dashboards/AgentDashboard";
import AdminDashboard from "./pages/teammate-dashboards/AdminDashboard";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";

import { ChatbotButton } from "@/components/ChatbotButton";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <HotToaster position="top-right" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Explore />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify" element={<VerifyEmail />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/hotel-dashboard" element={<DashboardLayout><HotelDashboard /></DashboardLayout>} />
                    <Route path="/agent-dashboard" element={<DashboardLayout><AgentDashboard /></DashboardLayout>} />
                    <Route path="/admin-dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
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
            </BrowserRouter>
            <ChatbotButton />
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
