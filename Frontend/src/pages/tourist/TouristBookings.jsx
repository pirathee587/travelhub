import React, { useState, useEffect } from 'react';
import touristService from '../../services/touristService';
import toast from 'react-hot-toast';

const TouristBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await touristService.getBookings(user.userId);
            setBookings(data);
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await touristService.cancelBooking(id);
            toast.success("Booking cancelled");
            fetchBookings();
        } catch (error) {
            toast.error("Cancellation failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Bookings</h2>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm">Explore More Packages</button>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : bookings.length === 0 ? (
                    <div className="col-12 text-center py-5 card border-0 shadow-sm rounded-4">
                        <div className="card-body">
                            <i className="bi bi-calendar2-x fs-1 text-muted mb-3 d-block"></i>
                            <h5>No Bookings Found</h5>
                            <p className="text-muted">You haven't made any bookings yet.</p>
                            <button className="btn btn-primary rounded-pill px-4">Start Planning</button>
                        </div>
                    </div>
                ) : (
                    bookings.map(b => (
                        <div key={b.id} className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted small">ID: {b.bookingId}</span>
                                        <span className={`badge rounded-pill bg-opacity-10 text-${b.status === 'Completed' ? 'success' : b.status === 'Cancelled' ? 'danger' : 'primary'} bg-${b.status === 'Completed' ? 'success' : b.status === 'Cancelled' ? 'danger' : 'primary'} px-3`}>
                                            {b.status}
                                        </span>
                                    </div>
                                    <h5 className="card-title mb-1">{b.packageName || 'Custom Trip'}</h5>
                                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-2"></i>{b.destination}</p>
                                    
                                    <div className="row g-3 mb-4">
                                        <div className="col-6 border-end">
                                            <small className="text-muted d-block">Start Date</small>
                                            <span className="fw-medium">{b.startDate}</span>
                                        </div>
                                        <div className="col-6 ps-3">
                                            <small className="text-muted d-block">End Date</small>
                                            <span className="fw-medium">{b.endDate}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                        <div>
                                            <small className="text-muted d-block">Total Amount</small>
                                            <span className="h5 mb-0 fw-bold text-primary">${b.totalPrice}</span>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-light rounded-pill px-3 btn-sm">Details</button>
                                            {b.status === 'Pending' && (
                                                <button className="btn btn-outline-danger rounded-pill px-3 btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TouristBookings;
