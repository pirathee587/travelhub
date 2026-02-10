import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/Layout'
import ModalProvider from './components/ModalContext'
import Dashboard from './pages/Dashboard'
import AgentApprovals from './pages/AgentApprovals'
import HotelApprovals from './pages/HotelApprovals'
import PackageApprovals from './pages/PackageApprovals'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import HotelDetailsPage from './pages/HotelDetails'
import AgentDetailsPage from './pages/AgentDetails'
import PackageDetailsPage from './pages/PackageDetails'

export default function Router(){
  return (
    <BrowserRouter>
      <ModalProvider>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<AgentApprovals/>} />
          <Route path="hotels" element={<HotelApprovals/>} />
          <Route path="packages" element={<PackageApprovals/>} />
          <Route path="payments" element={<Payments/>} />
          <Route path="analytics" element={<Analytics/>} />
        </Route>
        <Route path="agents/:id" element={<AgentDetailsPage />} />
        <Route path="hotels/:id" element={<HotelDetailsPage />} />
        <Route path="packages/:id" element={<PackageDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ModalProvider>
    </BrowserRouter>
  )
}
