import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.userId) {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await agentService.getStats(user.userId);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats", error);
            toast.error("Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    const cards = [
        { title: 'Total Packages', value: stats?.totalPackages || 0, icon: 'bi-box-seam', color: 'primary' },
        { title: 'Active Trips', value: stats?.activeTrips || 0, icon: 'bi-map', color: 'success' },
        { title: 'Pending Requests', value: stats?.pendingRequests || 0, icon: 'bi-clock-history', color: 'warning' },
        { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || 0}`, icon: 'bi-currency-dollar', color: 'info' },
        { title: 'Average Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: 'bi-star-fill', color: 'danger' },
        { title: 'Total Vehicles', value: stats?.totalVehicles || 0, icon: 'bi-truck', color: 'secondary' },
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Agent Dashboard</h2>
            <div className="row g-4">
                {cards.map((card, index) => (
                    <div key={index} className="col-md-4 col-sm-6">
                        <div className={`card h-100 border-0 shadow-sm border-start border-${card.color} border-4`}>
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className={`flex-shrink-0 bg-${card.color} bg-opacity-10 p-3 rounded-3`}>
                                        <i className={`bi ${card.icon} text-${card.color} fs-3`}></i>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h6 className="card-subtitle mb-1 text-muted">{card.title}</h6>
                                        <h3 className="card-title mb-0">{card.value}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row mt-5">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <button className="btn btn-primary w-100 py-3 rounded-3">
                                        <i className="bi bi-plus-circle me-2"></i> Add New Package
                                    </button>
                                </div>
                                <div className="col-sm-6">
                                    <button className="btn btn-outline-success w-100 py-3 rounded-3">
                                        <i className="bi bi-person-plus me-2"></i> Register Driver
                                    </button>
                                </div>
                                <div className="col-sm-6">
                                    <button className="btn btn-outline-info w-100 py-3 rounded-3">
                                        <i className="bi bi-truck-flatbed me-2"></i> Add Vehicle
                                    </button>
                                </div>
                                <div className="col-sm-6">
                                    <button className="btn btn-outline-secondary w-100 py-3 rounded-3">
                                        <i className="bi bi-gear me-2"></i> Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Recent Notifications</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted text-center py-5">No new notifications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
