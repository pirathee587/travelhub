import { Routes, Route, Navigate } from 'react-router-dom';

// ── Auth pages ─────────────────────────────────────────────────────────────
import LandingPage from '@/auth/pages/LandingPage';
import AuthPage from '@/auth/pages/AuthPage';
import VerifyEmail from '@/auth/pages/VerifyEmail';
import ForgotPassword from '@/auth/pages/ForgotPassword';
import ResetPassword from '@/auth/pages/ResetPassword';

// ── Role-based route groups ────────────────────────────────────────────────
import TouristRoutes    from './TouristRoutes';
import AgencyRoutes     from './AgencyRoutes';
import AdminRoutes      from './AdminRoutes';
import HotelOwnerRoutes from './HotelOwnerRoutes';

/**
 * AppRoutes — Main Traffic Controller
 *
 * /                    → Tourist Explore (Landing)
 * /login, /signup      → Tourist Login/Signup
 * /auth/:role          → Dynamic Auth Page
 * /tourist/*           → TouristRoutes
 * /agency/*            → AgencyRoutes
 * /admin/*             → AdminRoutes
 * /hotelowner/*        → HotelOwnerRoutes
 * *                    → redirect to /
 */
export default function AppRoutes() {
  return (
    <Routes>

      {/* ── General Auth Routes ── */}
      <Route path="/login" element={<AuthPage role="tourist" mode="login" />} />
      <Route path="/signup" element={<AuthPage role="tourist" mode="signup" />} />
      <Route path="/auth/:role" element={<AuthPage />} />

      {/* ── Portal Specific Auth Routes (from developer guide) ── */}
      <Route path="/tourist/login" element={<AuthPage role="tourist" mode="login" />} />
      <Route path="/tourist/signup" element={<AuthPage role="tourist" mode="signup" />} />
      <Route path="/agency/login" element={<AuthPage role="agency" mode="login" />} />
      <Route path="/agency/signup" element={<AuthPage role="agency" mode="signup" />} />
      <Route path="/hotelowner/login" element={<AuthPage role="hotelowner" mode="login" />} />
      <Route path="/hotelowner/signup" element={<AuthPage role="hotelowner" mode="signup" />} />
      <Route path="/admin/login" element={<AuthPage role="admin" mode="login" />} />

      {/* ── Email Verification ── */}
      <Route path="/verify" element={<VerifyEmail />} />

      {/* ── Forgot / Reset Password ── */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Tourist Portal (contains public root / route) ── */}
      {TouristRoutes()}

      {/* ── Agency Portal ── */}
      {AgencyRoutes()}

      {/* ── Admin Portal ── */}
      {AdminRoutes()}

      {/* ── Hotel Owner Portal ── */}
      {HotelOwnerRoutes()}

      {/* ── Catch-all: unknown URLs → Public Landing Page ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
