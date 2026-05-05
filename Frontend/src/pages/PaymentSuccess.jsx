import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div className="container mt-5 text-center">
            <div className="card shadow-lg border-0 p-5 rounded-4">
                <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
                </div>
                <h2 className="fw-bold text-success mb-3">Payment Successful!</h2>
                <p className="lead text-muted mb-4">
                    Thank you for your booking. Your payment has been processed successfully.
                    An email confirmation has been sent to your registered address.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <Link to="/dashboard" className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                        Go to My Dashboard
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary btn-lg px-5 rounded-pill">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
