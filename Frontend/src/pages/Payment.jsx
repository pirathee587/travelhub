import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import bookingService from '../services/bookingService';
import { toast } from 'react-hot-toast';

const Payment = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkoutData, setCheckoutData] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const bData = await bookingService.getBookingDetails(id);
                setBooking(bData);
                
                const cData = await paymentService.getCheckoutData(id);
                setCheckoutData(cData);
            } catch (error) {
                console.error("Error fetching payment details", error);
                toast.error("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!booking) {
        return <div className="container mt-5 text-center"><h3>Booking not found</h3></div>;
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-primary text-white py-3">
                            <h4 className="mb-0 text-center">Secure Payment</h4>
                        </div>
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <i className="bi bi-shield-check text-success display-4"></i>
                                <p className="text-muted mt-2">Complete your booking securely via PayHere</p>
                            </div>

                            <div className="bg-light p-3 rounded-3 mb-4">
                                <h6 className="text-uppercase text-muted small fw-bold mb-3">Booking Summary</h6>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Package:</span>
                                    <span className="fw-bold">{booking.packageName}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Duration:</span>
                                    <span>{booking.duration}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <span className="h5 mb-0">Total Amount:</span>
                                    <span className="h5 mb-0 text-primary fw-bold">LKR {booking.totalPrice?.toLocaleString()}</span>
                                </div>
                            </div>

                            {checkoutData && (
                                <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
                                    <input type="hidden" name="merchant_id" value={checkoutData.merchant_id} />
                                    <input type="hidden" name="return_url" value="http://localhost:5173/payment-success" />
                                    <input type="hidden" name="cancel_url" value="http://localhost:5173/payment-cancel" />
                                    <input type="hidden" name="notify_url" value="http://localhost:8080/api/payments/notify" />
                                    <input type="hidden" name="order_id" value={checkoutData.order_id} />
                                    <input type="hidden" name="items" value={checkoutData.items} />
                                    <input type="hidden" name="currency" value={checkoutData.currency} />
                                    <input type="hidden" name="amount" value={checkoutData.amount} />
                                    <input type="hidden" name="first_name" value={checkoutData.first_name} />
                                    <input type="hidden" name="last_name" value={checkoutData.last_name} />
                                    <input type="hidden" name="email" value={checkoutData.email} />
                                    <input type="hidden" name="phone" value={checkoutData.phone} />
                                    <input type="hidden" name="address" value={checkoutData.address} />
                                    <input type="hidden" name="city" value={checkoutData.city} />
                                    <input type="hidden" name="country" value={checkoutData.country} />
                                    <input type="hidden" name="hash" value={checkoutData.hash} />

                                    <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow-sm">
                                        Pay Now with PayHere
                                    </button>
                                </form>
                            )}

                            <div className="text-center mt-4">
                                <img src="https://www.payhere.lk/downloads/images/payhere_short_banner_dark.png" alt="PayHere" style={{ height: '30px' }} />
                                <p className="text-muted small mt-2">100% Secure Transaction</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
