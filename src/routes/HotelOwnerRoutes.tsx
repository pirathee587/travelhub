import { Route } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from '@/auth/components/ProtectedRoute';

// ── Lazy-loaded HotelOwner Pages ──────────────────────────────────────────
const Index       = lazy(() => import('@/features/hotelOwner/pages/index'));
const NewHotel    = lazy(() => import('@/features/hotelOwner/pages/hotels.new'));
const HotelDetail = lazy(() => import('@/features/hotelOwner/pages/hotels.$hotelId'));
const HotelEdit   = lazy(() => import('@/features/hotelOwner/pages/hotels.$hotelId.edit'));
const Dashboard   = lazy(() => import('@/features/hotelOwner/pages/dashboard.$hotelId'));
const Settings    = lazy(() => import('@/features/hotelOwner/pages/settings'));

/**
 * HotelOwnerRoutes
 * All routes under /hotelowner/*
 */
export default function HotelOwnerRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["HOTEL_OWNER"]} />}>
      <Route path="/hotelowner"                          element={<Index />} />
      <Route path="/hotelowner/hotels/new"               element={<NewHotel />} />
      <Route path="/hotelowner/hotels/:hotelId"          element={<HotelDetail />} />
      <Route path="/hotelowner/hotels/:hotelId/edit"     element={<HotelEdit />} />
      <Route path="/hotelowner/dashboard/:hotelId"       element={<Dashboard />} />
      <Route path="/hotelowner/settings"                 element={<Settings />} />
    </Route>
  );
}
