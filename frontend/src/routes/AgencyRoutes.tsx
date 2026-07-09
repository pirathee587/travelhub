import { Route, Outlet } from 'react-router-dom';
import { lazy } from 'react';
import { CurrencyProvider } from '@/features/agency/hooks/CurrencyContext';
import ProtectedRoute from '@/auth/components/ProtectedRoute';

// ── Lazy-loaded Agency Pages ──────────────────────────────────────────────
const Index         = lazy(() => import('@/features/agency/pages/Index'));
const Vehicles      = lazy(() => import('@/features/agency/pages/Vehicles'));
const Bookings      = lazy(() => import('@/features/agency/pages/Bookings'));
const BookingDetail = lazy(() => import('@/features/agency/pages/BookingDetails'));
const Packages      = lazy(() => import('@/features/agency/pages/Packages'));
const PackageDetail = lazy(() => import('@/features/agency/pages/PackageDetails'));
const Analytics     = lazy(() => import('@/features/agency/pages/Analytics'));
const Profile       = lazy(() => import('@/features/agency/pages/Profile'));
const Settings      = lazy(() => import('@/features/agency/pages/Settings'));

const AgencyLayoutWrapper = () => (
  <CurrencyProvider>
    <Outlet />
  </CurrencyProvider>
);

/**
 * AgencyRoutes
 * All routes under /agency/*
 */
export default function AgencyRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["AGENT"]} />}>
      <Route element={<AgencyLayoutWrapper />}>
        <Route path="/agency"               element={<Index />} />
        <Route path="/agency/vehicles"      element={<Vehicles />} />
        <Route path="/agency/bookings"      element={<Bookings />} />
        <Route path="/agency/bookings/:id"  element={<BookingDetail />} />
        <Route path="/agency/packages"      element={<Packages />} />
        <Route path="/agency/packages/:id"  element={<PackageDetail />} />
        <Route path="/agency/analytics"     element={<Analytics />} />
        <Route path="/agency/profile"       element={<Profile />} />
        <Route path="/agency/settings"      element={<Settings />} />
      </Route>
    </Route>
  );
}
