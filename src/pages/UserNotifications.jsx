import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Notifications</h2>
          <p className="text-muted mb-0">Stay updated on bookings, payments, and account activity.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/billing" className="btn btn-outline-primary rounded-pill px-4">Billing</Link>
          <button className="btn btn-light rounded-pill px-4" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <i className="bi bi-bell fs-1 text-muted mb-3 d-block"></i>
            <h5>No notifications yet</h5>
            <p className="text-muted">We will notify you about bookings, payments, and account updates.</p>
          </div>
        </div>
      ) : (
        <div className="list-group shadow-sm rounded-4 overflow-hidden">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`list-group-item list-group-item-action border-0 py-4 px-4 ${notification.read ? '' : 'bg-primary-subtle'}`}
              onClick={() => handleOpen(notification)}
            >
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="text-start">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-secondary-subtle text-secondary">{notification.type}</span>
                    {!notification.read && <span className="badge bg-primary">New</span>}
                  </div>
                  <h6 className="mb-1 fw-bold">{notification.title}</h6>
                  <p className="mb-0 text-muted">{notification.message}</p>
                </div>
                <small className="text-muted text-nowrap">{notification.time}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
