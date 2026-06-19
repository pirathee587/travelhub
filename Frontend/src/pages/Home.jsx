import React from 'react';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'AGENT':
        return <Navigate to="/agent/dashboard" replace />;
      case 'HOTEL_OWNER':
        return <Navigate to="/owner/dashboard" replace />;
      case 'TOURIST':
      default:
        return <Navigate to="/tourist/dashboard" replace />;
    }
  }

  return (
    <div className="container mt-5 text-center">
      <h1>Welcome to TravelHub Sri Lanka</h1>
      <p className="lead">Your all-in-one travel management platform.</p>
    </div>
  );
};

export default Home;
