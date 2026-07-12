import { Route } from 'react-router-dom';
import { lazy } from 'react';
import AdminLayout       from '@/features/admin/components/Layout';
import AdminModalProvider from '@/features/admin/components/ModalContext';
import ProtectedRoute from '@/auth/components/ProtectedRoute';

// ── Lazy-loaded Admin Pages ───────────────────────────────────────────────
const Dashboard        = lazy(() => import('@/features/admin/pages/Dashboard'));
const AgentApprovals   = lazy(() => import('@/features/admin/pages/AgentApprovals'));
const AgentDetails     = lazy(() => import('@/features/admin/pages/AgentDetails'));
const HotelApprovals   = lazy(() => import('@/features/admin/pages/HotelApprovals'));
const HotelDetails     = lazy(() => import('@/features/admin/pages/HotelDetails'));
const PackageApprovals = lazy(() => import('@/features/admin/pages/PackageApprovals'));
const PackageDetails   = lazy(() => import('@/features/admin/pages/PackageDetails'));
const Payments         = lazy(() => import('@/features/admin/pages/Payments'));
const Analytics        = lazy(() => import('@/features/admin/pages/Analytics'));
const Users            = lazy(() => import('@/features/admin/pages/Users'));

/**
 * AdminRoutes
 * All routes under /admin/*
 * Uses AdminLayout (Sidebar + Header) as the shell via nested <Outlet />.
 * Detail pages (AgentDetails, HotelDetails, PackageDetails) sit outside the
 * layout shell so they render full-screen without the sidebar.
 */
export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
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
        <Route path="packages"      element={<PackageApprovals />} />
        <Route path="payments"      element={<Payments />} />
        <Route path="analytics"     element={<Analytics />} />
        <Route path="users"         element={<Users />} />
      </Route>

      {/* ── Detail pages — full-screen, outside the layout shell ── */}
      <Route path="/admin/agents/:id"   element={<AgentDetails />} />
      <Route path="/admin/hotels/:id"   element={<HotelDetails />} />
      <Route path="/admin/packages/:id" element={<PackageDetails />} />
    </Route>
  );
}
