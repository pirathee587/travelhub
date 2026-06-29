import { Route } from 'react-router-dom';
import { lazy } from 'react';
import TouristLayout from '@/features/tourist/components/TouristLayout';

// ── Lazy-loaded Tourist Pages ─────────────────────────────────────────────
const Explore          = lazy(() => import('@/features/tourist/pages/Explore'));
const Overview         = lazy(() => import('@/features/tourist/pages/Overview'));
const MyTrips          = lazy(() => import('@/features/tourist/pages/MyTrips'));
const Documents        = lazy(() => import('@/features/tourist/pages/Documents'));
const Hotels           = lazy(() => import('@/features/tourist/pages/Hotel'));
const HotelDetails     = lazy(() => import('@/features/tourist/pages/HotelDetails'));
const Agents           = lazy(() => import('@/features/tourist/pages/Agents'));
const AgentDetails     = lazy(() => import('@/features/tourist/pages/AgentDetails'));
const PackageDetails   = lazy(() => import('@/features/tourist/pages/PackageDetails'));
const PackageReserve   = lazy(() => import('@/features/tourist/pages/PackageReservation'));
const Settings         = lazy(() => import('@/features/tourist/pages/Settings'));
const NotFound         = lazy(() => import('@/features/tourist/pages/NotFound'));

/**
 * TouristRoutes
 * All routes under /tourist/*
 * Wrapped with TouristLayout → renders ChatbotButton on every tourist page
 */
export default function TouristRoutes() {
  return (
    <Route element={<TouristLayout />}>
      <Route path="/tourist"                              element={<Explore />} />
      <Route path="/tourist/explore"                     element={<Explore />} />
      <Route path="/tourist/explore/package/:id"         element={<PackageDetails />} />
      <Route path="/tourist/explore/package/:id/reserve" element={<PackageReserve />} />
      <Route path="/tourist/overview"                    element={<Overview />} />
      <Route path="/tourist/trips"                       element={<MyTrips />} />
      <Route path="/tourist/documents"                   element={<Documents />} />
      <Route path="/tourist/hotels"                      element={<Hotels />} />
      <Route path="/tourist/hotels/:id"                  element={<HotelDetails />} />
      <Route path="/tourist/agents"                      element={<Agents />} />
      <Route path="/tourist/agents/:id"                  element={<AgentDetails />} />
      <Route path="/tourist/settings"                    element={<Settings />} />
      <Route path="/tourist/*"                           element={<NotFound />} />
    </Route>
  );
}
