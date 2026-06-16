import React, { useState, useEffect } from 'react';
import ownerService from '../../services/ownerService';
import toast from 'react-hot-toast';

const HotelOwnerDashboard = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const data = await ownerService.getHotels('Approved');
            setHotels(data);
            if (data.length > 0) {
                setSelectedHotel(data[0]);
                fetchStats(data[0].id);
            }
        } catch (error) {
            console.error("Error fetching hotels", error);
            toast.error("Failed to load hotels");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (hotelId) => {
        try {
            const data = await ownerService.getDashboardStats(hotelId);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats", error);
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
        { title: 'Today\'s Bookings', value: stats?.todayBookings || 0, icon: 'bi-calendar-check', color: 'primary' },
        { title: 'Total Rooms', value: stats?.totalRooms || 0, icon: 'bi-door-closed', color: 'success' },
        { title: 'Available Rooms', value: stats?.availableRooms || 0, icon: 'bi-check-all', color: 'info' },
        { title: 'Monthly Revenue', value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`, icon: 'bi-cash-stack', color: 'warning' },
    ];

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Hotel Management</h2>
                <div className="d-flex gap-2">
                    <select 
                        className="form-select border-0 shadow-sm rounded-pill px-4" 
                        value={selectedHotel?.id}
                        onChange={(e) => {
                            const hotel = hotels.find(h => h.id === parseInt(e.target.value));
                            setSelectedHotel(hotel);
                            fetchStats(hotel.id);
                        }}
                    >
                        {hotels.map(h => (
                            <option key={h.id} value={h.id}>{h.hotelName}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary rounded-pill px-4">
                        <i className="bi bi-plus-lg me-2"></i> Add Hotel
                    </button>
                </div>
            </div>

            {hotels.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                    <div className="card-body">
                        <i className="bi bi-building fs-1 text-muted mb-3 d-block"></i>
                        <h5>No Hotels Found</h5>
                        <p className="text-muted">You haven't added any hotels to your profile yet.</p>
                        <button className="btn btn-primary rounded-pill px-4 mt-2">Get Started</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="row g-4 mb-5">
                        {cards.map((card, index) => (
                            <div key={index} className="col-md-3 col-sm-6">
                                <div className="card h-100 border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4">
                                        <div className={`text-${card.color} mb-3`}>
                                            <i className={`bi ${card.icon} fs-3`}></i>
                                        </div>
                                        <h6 className="text-muted small mb-1">{card.title}</h6>
                                        <h3 className="mb-0 fw-bold">{card.value}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Recent Bookings</h5>
                                    <button className="btn btn-sm btn-link text-decoration-none">View All</button>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="px-4">Customer</th>
                                                    <th>Room</th>
                                                    <th>Dates</th>
                                                    <th className="text-end px-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats?.recentBookings?.length > 0 ? (
                                                    stats.recentBookings.map(b => (
                                                        <tr key={b.id}>
                                                            <td className="px-4 fw-bold">{b.customerName}</td>
                                                            <td>{b.roomType}</td>
                                                            <td className="small">{b.checkIn} - {b.checkOut}</td>
                                                            <td className="text-end px-4">
                                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3">{b.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-5 text-muted">No recent bookings</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-header bg-white border-0 py-3">
                                    <h5 className="mb-0">Quick Tools</h5>
                                </div>
                                <div className="card-body">
                                    <button className="btn btn-outline-primary w-100 mb-3 rounded-pill text-start px-4 py-3">
                                        <i className="bi bi-door-open me-3 fs-5"></i> Manage Rooms
                                    </button>
                                    <button className="btn btn-outline-info w-100 mb-3 rounded-pill text-start px-4 py-3">
                                        <i className="bi bi-gear me-3 fs-5"></i> Hotel Settings
                                    </button>
                                    <button className="btn btn-outline-success w-100 rounded-pill text-start px-4 py-3">
                                        <i className="bi bi-star me-3 fs-5"></i> View Reviews
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HotelOwnerDashboard;
