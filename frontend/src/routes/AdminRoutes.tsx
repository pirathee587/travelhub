import { Route, Outlet } from 'react-router-dom';
import { lazy } from 'react';
import AdminLayout       from '@/features/admin/components/Layout';
import AdminModalProvider from '@/features/admin/components/ModalContext';
import { AdminCurrencyProvider } from '@/features/admin/hooks/AdminCurrencyContext';
import ProtectedRoute from '@/auth/components/ProtectedRoute';

// ── Lazy-loaded Admin Pages ───────────────────────────────────────────────
const Dashboard        = lazy(() => import('@/features/admin/pages/Dashboard'));
const AgentApprovals   = lazy(() => import('@/features/admin/pages/AgentApprovals'));
const AgentDetails     = lazy(() => import('@/features/admin/pages/AgentDetails'));
const HotelApprovals   = lazy(() => import('@/features/admin/pages/HotelApprovals'));
const HotelDetails     = lazy(() => import('@/features/admin/pages/HotelDetails'));
const VehicleApprovals = lazy(() => import('@/features/admin/pages/VehicleApprovals'));
const DriverApprovals  = lazy(() => import('@/features/admin/pages/DriverApprovals'));
const PackageApprovals = lazy(() => import('@/features/admin/pages/PackageApprovals'));
const PackageDetails   = lazy(() => import('@/features/admin/pages/PackageDetails'));
const PayoutApprovals  = lazy(() => import('@/features/admin/pages/PayoutApprovals'));
const Analytics        = lazy(() => import('@/features/admin/pages/Analytics'));
const PackageReports   = lazy(() => import('@/features/admin/pages/PackageReports'));
const Settings         = lazy(() => import('@/features/admin/pages/Settings'));

const AdminCurrencyWrapper = () => (
  <AdminCurrencyProvider>
    <Outlet />
  </AdminCurrencyProvider>
);

/**
 * AdminRoutes
 * All routes under /admin/*
 * Uses AdminLayout (Sidebar + Header) as the shell via nested <Outlet />.
 * Detail pages (AgentDetails, HotelDetails, PackageDetails) sit outside the
 * layout shell so they render full-screen without the sidebar.
 */
export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ROLE_ADMIN"]} />}>
      <Route element={<AdminCurrencyWrapper />}>
        {/* ── Sidebar + Header layout wraps all main admin pages ── */}
        <Route
          path="/admin"
          element={
            <AdminModalProvider>
              <AdminLayout />
            </AdminModalProvider>
          }
        >
          <Route index                element={<Dashboard />} />
          <Route path="agents"        element={<AgentApprovals />} />
          <Route path="hotels"        element={<HotelApprovals />} />
          <Route path="vehicles"      element={<VehicleApprovals />} />
          <Route path="drivers"       element={<DriverApprovals />} />
          <Route path="packages"      element={<PackageApprovals />} />
          <Route path="payouts"       element={<PayoutApprovals />} />
          <Route path="reports"       element={<PackageReports />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="settings"      element={<Settings />} />
        </Route>

        {/* ── Detail pages — full-screen, outside the layout shell ── */}
        <Route path="/admin/agents/:id"   element={<AgentDetails />} />
        <Route path="/admin/hotels/:id"   element={<HotelDetails />} />
        <Route path="/admin/packages/:id" element={<PackageDetails />} />
      </Route>
    </Route>
  );
}
