import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
    return (
        <div className="container mt-5 text-center">
            <div className="card shadow-lg border-0 p-5 rounded-4">
                <div className="mb-4">
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
                </div>
                <h2 className="fw-bold text-danger mb-3">Payment Cancelled</h2>
                <p className="lead text-muted mb-4">
                    The payment process was interrupted or cancelled. No charges were made to your account.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                    <Link to="/" className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
                        Try Again
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary btn-lg px-5 rounded-pill">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
