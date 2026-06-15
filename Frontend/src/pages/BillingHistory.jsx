import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import billingService from '../services/billingService';
import toast from 'react-hot-toast';

const BillingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await billingService.getHistory();
      setHistory(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (bookingId) => {
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
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Billing & Payments</h2>
          <p className="text-muted mb-0">View your payment history and download receipts.</p>
        </div>
        <Link to="/notifications" className="btn btn-outline-primary rounded-pill px-4">
          <i className="bi bi-bell me-2"></i> Notifications
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : history.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <i className="bi bi-receipt fs-1 text-muted mb-3 d-block"></i>
            <h5>No payments yet</h5>
            <p className="text-muted">Your completed payments and receipts will appear here.</p>
            <Link to="/dashboard" className="btn btn-primary rounded-pill px-4">Go to Dashboard</Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {history.map((item) => (
            <div key={item.paymentId} className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className={`badge rounded-pill bg-${item.status === 'Completed' ? 'success' : item.status === 'Failed' ? 'danger' : 'warning'}-subtle text-${item.status === 'Completed' ? 'success' : item.status === 'Failed' ? 'danger' : 'warning'}`}>
                        {item.status}
                      </span>
                      <small className="text-muted">{item.date}</small>
                    </div>
                    <h5 className="mb-1">{item.packageName}</h5>
                    <p className="text-muted small mb-1">Transaction: {item.transactionId}</p>
                    <p className="text-muted small mb-0">Booking ID: {item.bookingId}</p>
                  </div>
                  <div className="text-md-end">
                    <div className="h4 text-primary fw-bold mb-3">LKR {item.amount?.toLocaleString()}</div>
                    <div className="d-flex gap-2 justify-content-md-end">
                      {item.status !== 'Completed' && item.bookingId && (
                        <Link to={`/payment/${item.bookingId}`} className="btn btn-primary rounded-pill px-4">
                          Pay Now
                        </Link>
                      )}
                      {item.receiptAvailable && (
                        <button
                          className="btn btn-outline-success rounded-pill px-4"
                          onClick={() => handleDownloadReceipt(item.bookingId)}
                        >
                          <i className="bi bi-download me-2"></i> Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
