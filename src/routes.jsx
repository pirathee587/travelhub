import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout'
import ModalProvider from './components/ModalContext'

import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import AgentApprovals  from './pages/AgentApprovals'
import HotelApprovals  from './pages/HotelApprovals'
import PackageApprovals from './pages/PackageApprovals'
import Payments        from './pages/Payments'
import Analytics       from './pages/Analytics'
import HotelDetailsPage   from './pages/HotelDetails'
import AgentDetailsPage   from './pages/AgentDetails'
import PackageDetailsPage from './pages/PackageDetails'
import Users           from './pages/Users'

// ── Protected Route Guard ────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function Router() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>

          {/* ── Public Route ──────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Admin Protected Routes ────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index             element={<Dashboard />} />
            <Route path="agents"     element={<AgentApprovals />} />
            <Route path="hotels"     element={<HotelApprovals />} />
            <Route path="packages"   element={<PackageApprovals />} />
            <Route path="payments"   element={<Payments />} />
            <Route path="analytics"  element={<Analytics />} />
            <Route path="users"      element={<Users />} />
          </Route>

          {/* Detail pages (also protected) */}
          <Route path="agents/:id"   element={<ProtectedRoute><AgentDetailsPage /></ProtectedRoute>} />
          <Route path="hotels/:id"   element={<ProtectedRoute><HotelDetailsPage /></ProtectedRoute>} />
          <Route path="packages/:id" element={<ProtectedRoute><PackageDetailsPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}
