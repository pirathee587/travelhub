import { Routes, Route, Navigate } from 'react-router-dom';

// ── Auth pages ─────────────────────────────────────────────────────────────
import LandingPage from '@/auth/pages/LandingPage';

// ── Role-based route groups ────────────────────────────────────────────────
import TouristRoutes    from './TouristRoutes';
import AgencyRoutes     from './AgencyRoutes';
import AdminRoutes      from './AdminRoutes';
import HotelOwnerRoutes from './HotelOwnerRoutes';

/**
 * AppRoutes — Main Traffic Controller
 *
 * /                    → LandingPage   (role selection)
 * /tourist/*           → TouristRoutes
 * /agency/*            → AgencyRoutes
 * /admin/*             → AdminRoutes
 * /hotelowner/*        → HotelOwnerRoutes
 * *                    → redirect to /
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Landing & Auth ── */}
      <Route path="/"            element={<LandingPage />} />

      {/* ── Tourist Portal ── */}
      {TouristRoutes()}

      {/* ── Agency Portal ── */}
      {AgencyRoutes()}

      {/* ── Admin Portal ── */}
      {AdminRoutes()}

      {/* ── Hotel Owner Portal ── */}
      {HotelOwnerRoutes()}

      {/* ── Catch-all: unknown URLs → Landing ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
