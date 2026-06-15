import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import billingService from '../services/billingService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = Object.fromEntries(searchParams.entries());
      if (!params.order_id || !params.md5sig) {
        setVerifying(false);
        return;
      }

      try {
        await api.get('/payments/return', { params });
        setVerified(true);
        toast.success('Payment verified successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleDownloadReceipt = async () => {
    if (!bookingId) return;
    try {
      const response = await billingService.downloadReceipt(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_Booking_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  return (
    <div className="container mt-5 text-center">
      <div className="card shadow-lg border-0 p-5 rounded-4">
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
        </div>
        <h2 className="fw-bold text-success mb-3">Payment Successful!</h2>
        {verifying ? (
          <p className="lead text-muted mb-4">Verifying your payment...</p>
        ) : (
          <p className="lead text-muted mb-4">
            Thank you for your booking. {verified ? 'Your payment has been confirmed and a confirmation email has been sent.' : 'If you completed payment on PayHere, it will appear in your billing history shortly.'}
          </p>
        )}
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          {bookingId && verified && (
            <button onClick={handleDownloadReceipt} className="btn btn-success btn-lg px-5 rounded-pill shadow-sm">
              <i className="bi bi-download me-2"></i> Download Receipt
            </button>
          )}
          <Link to="/billing" className="btn btn-primary btn-lg px-5 rounded-pill shadow-sm">
            View Billing History
          </Link>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-lg px-5 rounded-pill">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
