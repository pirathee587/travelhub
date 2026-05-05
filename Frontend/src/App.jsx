import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Signup from './pages/Signup';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Dashboard from './pages/Dashboard';
import SearchPackages from './pages/tourist/SearchPackages';
import PackageDetail from './pages/PackageDetail';

// Role-based pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentPackages from './pages/agent/AgentPackages';
import AgentPackageForm from './pages/agent/AgentPackageForm';
import AgentDrivers from './pages/agent/AgentDrivers';
import AgentVehicles from './pages/agent/AgentVehicles';
import AgentBookings from './pages/agent/AgentBookings';
import AgentAnalytics from './pages/agent/AgentAnalytics';
import AgentSettings from './pages/agent/AgentSettings';
import AgentReviews from './pages/agent/AgentReviews';

import TouristDashboard from './pages/tourist/TouristDashboard';
import TouristBookings from './pages/tourist/TouristBookings';
import TouristDocuments from './pages/tourist/TouristDocuments';

import HotelOwnerDashboard from './pages/owner/HotelOwnerDashboard';
import OwnerHotels from './pages/owner/OwnerHotels';
import OwnerRooms from './pages/owner/OwnerRooms';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
          <div className="container">
            <Link className="navbar-brand fw-bold fs-3" to="/">
              <span className="text-primary">Travel</span>Hub
            </Link>
            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                <Link className="nav-link fw-medium" to="/packages">Explore Packages</Link>
              </div>
              <div className="navbar-nav ms-auto align-items-center gap-3">
                {user ? (
                  <>
                    <Link className="nav-link fw-medium" to="/dashboard">Dashboard</Link>
                    <div className="dropdown">
                      <button className="btn btn-outline-light rounded-pill px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-person-circle me-2"></i> {user.name}
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3">
                        <li><Link className="dropdown-item py-2" to="/profile"><i className="bi bi-person me-2"></i> Profile</Link></li>
                        <li><Link className="dropdown-item py-2" to="/settings"><i className="bi bi-gear me-2"></i> Settings</Link></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item py-2 text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i> Logout</button></li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <Link className="nav-link fw-medium" to="/login">Login</Link>
                    <Link className="btn btn-primary text-white rounded-pill px-4 shadow-sm" to="/signup">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/packages" element={<SearchPackages />} />
          <Route path="/packages/:id" element={<PackageDetail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<div className="container mt-5 text-center"><h1>Welcome to TravelHub Sri Lanka</h1><p className="lead">Your all-in-one travel management platform.</p></div>} />

          {/* Common Dashboard (Redirects based on role) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />

          {/* Agent Routes */}
          <Route path="/agent/dashboard" element={<ProtectedRoute role="AGENT"><AgentDashboard /></ProtectedRoute>} />
          <Route path="/agent/packages" element={<ProtectedRoute role="AGENT"><AgentPackages /></ProtectedRoute>} />
          <Route path="/agent/packages/new" element={<ProtectedRoute role="AGENT"><AgentPackageForm /></ProtectedRoute>} />
          <Route path="/agent/packages/edit/:id" element={<ProtectedRoute role="AGENT"><AgentPackageForm /></ProtectedRoute>} />
          <Route path="/agent/drivers" element={<ProtectedRoute role="AGENT"><AgentDrivers /></ProtectedRoute>} />
          <Route path="/agent/vehicles" element={<ProtectedRoute role="AGENT"><AgentVehicles /></ProtectedRoute>} />
          <Route path="/agent/bookings" element={<ProtectedRoute role="AGENT"><AgentBookings /></ProtectedRoute>} />
          <Route path="/agent/analytics" element={<ProtectedRoute role="AGENT"><AgentAnalytics /></ProtectedRoute>} />
          <Route path="/agent/settings" element={<ProtectedRoute role="AGENT"><AgentSettings /></ProtectedRoute>} />
          <Route path="/agent/reviews" element={<ProtectedRoute role="AGENT"><AgentReviews /></ProtectedRoute>} />

          {/* Tourist Routes */}
          <Route path="/tourist/dashboard" element={<ProtectedRoute role="TOURIST"><TouristDashboard /></ProtectedRoute>} />
          <Route path="/tourist/bookings" element={<ProtectedRoute role="TOURIST"><TouristBookings /></ProtectedRoute>} />
          <Route path="/tourist/documents" element={<ProtectedRoute role="TOURIST"><TouristDocuments /></ProtectedRoute>} />

          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute role="HOTEL_OWNER"><HotelOwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/hotels" element={<ProtectedRoute role="HOTEL_OWNER"><OwnerHotels /></ProtectedRoute>} />
          <Route path="/owner/hotels/:hotelId/rooms" element={<ProtectedRoute role="HOTEL_OWNER"><OwnerRooms /></ProtectedRoute>} />

          {/* Payment Routes */}
          <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
