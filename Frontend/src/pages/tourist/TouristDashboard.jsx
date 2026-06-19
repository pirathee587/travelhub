import React, { useState, useEffect } from 'react';
import touristService from '../../services/touristService';
import toast from 'react-hot-toast';

const TouristDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user && user.userId) {
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, tripsData] = await Promise.all([
                touristService.getStats(user.userId),
                touristService.getRecentTrips(user.userId)
            ]);
            setStats(statsData);
            setRecentTrips(tripsData);
        } catch (error) {
            console.error("Error fetching tourist data", error);
            toast.error("Failed to load dashboard data");
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
        { title: 'Total Trips', value: stats?.totalTrips || 0, icon: 'bi-briefcase', color: 'primary' },
        { title: 'Ongoing', value: stats?.ongoingTrips || 0, icon: 'bi-airplane-engines', color: 'success' },
        { title: 'Upcoming', value: stats?.upcomingTrips || 0, icon: 'bi-calendar-event', color: 'info' },
        { title: 'Completed', value: stats?.completedTrips || 0, icon: 'bi-check-circle', color: 'secondary' },
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Welcome back, {user.name}!</h2>
            
            <div className="row g-4 mb-5">
                {cards.map((card, index) => (
                    <div key={index} className="col-md-3 col-6">
                        <div className="card h-100 border-0 shadow-sm rounded-4">
                            <div className="card-body text-center p-4">
                                <div className={`bg-${card.color} bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3`}>
                                    <i className={`bi ${card.icon} text-${card.color} fs-4`}></i>
                                </div>
                                <h6 className="text-muted mb-1">{card.title}</h6>
                                <h3 className="mb-0">{card.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Trips</h5>
                            <button className="btn btn-sm btn-link text-decoration-none">View All</button>
                        </div>
                        <div className="card-body">
                            {recentTrips.length === 0 ? (
                                <div className="text-center py-5">
                                    <p className="text-muted">No trips found yet.</p>
                                    <button className="btn btn-primary rounded-pill px-4">Plan Your First Trip</button>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {recentTrips.map(trip => (
                                        <div key={trip.id} className="list-group-item px-0 py-3 border-0 border-bottom">
                                            <div className="d-flex align-items-center">
                                                <div className="flex-shrink-0">
                                                    <img src={trip.imageUrl || 'https://via.placeholder.com/60'} alt="" className="rounded-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                                                </div>
                                                <div className="flex-grow-1 ms-3">
                                                    <h6 className="mb-1">{trip.packageName}</h6>
                                                    <p className="small text-muted mb-0">{trip.startDate} - {trip.endDate}</p>
                                                </div>
                                                <div className="text-end">
                                                    <span className={`badge rounded-pill bg-opacity-10 text-${trip.status === 'Completed' ? 'success' : 'primary'} bg-${trip.status === 'Completed' ? 'success' : 'primary'} px-3`}>
                                                        {trip.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-4 mb-4">
                        <h4>Need Help?</h4>
                        <p className="small opacity-75">Our 24/7 support team is here to help you with your bookings and travel plans.</p>
                        <button className="btn btn-light rounded-pill px-4 mt-2">Contact Us</button>
                    </div>
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Upcoming Events</h5>
                        </div>
                        <div className="card-body">
                            <p className="small text-muted">No upcoming events scheduled.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TouristDashboard;
