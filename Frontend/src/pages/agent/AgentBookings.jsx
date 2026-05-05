import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await agentService.getBookings(user.userId, filter);
            setBookings(data);
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await agentService.acceptBooking(user.userId, id);
            toast.success("Booking accepted");
            fetchBookings();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleDecline = async (id) => {
        const reason = prompt("Enter reason for declining:");
        if (reason === null) return;
        try {
            await agentService.declineBooking(user.userId, id, reason);
            toast.success("Booking declined");
            fetchBookings();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'active': return 'bg-primary text-white';
            case 'completed': return 'bg-success text-white';
            case 'cancelled': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Bookings</h2>
                <div className="btn-group shadow-sm rounded-pill p-1 bg-white">
                    {['all', 'pending', 'active', 'completed', 'cancelled'].map(f => (
                        <button 
                            key={f}
                            className={`btn btn-sm rounded-pill px-3 border-0 ${filter === f ? 'btn-primary' : 'btn-white text-muted'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                            <tr>
                                <th className="px-4 py-3">Booking ID</th>
                                <th>Package / Trip</th>
                                <th>Dates</th>
                                <th>Total Price</th>
                                <th>Status</th>
                                <th className="text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No bookings found for this filter.</td></tr>
                            ) : (
                                bookings.map(b => (
                                    <tr key={b.id}>
                                        <td className="px-4 fw-medium">{b.bookingId}</td>
                                        <td>
                                            <div className="fw-bold">{b.packageName || 'Custom Trip'}</div>
                                            <div className="small text-muted">{b.destination}</div>
                                        </td>
                                        <td className="small">
                                            <div>{b.startDate}</div>
                                            <div className="text-muted">to {b.endDate}</div>
                                        </td>
                                        <td className="fw-bold text-primary">${b.totalPrice}</td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="text-end px-4">
                                            {b.status.toLowerCase() === 'pending' && (
                                                <>
                                                    <button className="btn btn-sm btn-success rounded-pill px-3 me-2" onClick={() => handleAccept(b.id)}>Accept</button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDecline(b.id)}>Decline</button>
                                                </>
                                            )}
                                            <button className="btn btn-sm btn-light rounded-circle ms-2"><i className="bi bi-eye"></i></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentBookings;
