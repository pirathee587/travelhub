import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const users = await adminService.getPendingUsers();
            setPendingUsers(users);
        } catch (error) {
            console.error("Error fetching pending users", error);
            toast.error("Failed to load pending applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            await adminService.approveUser(userId);
            toast.success("User approved successfully");
            fetchPending(); // Refresh list
        } catch (error) {
            toast.error("Approval failed");
        }
    };

    const handleReject = async (userId) => {
        const reason = prompt("Please enter the reason for rejection:");
        if (reason === null) return; // Cancelled

        try {
            await adminService.rejectUser(userId, reason);
            toast.success("User rejected");
            fetchPending(); // Refresh list
        } catch (error) {
            toast.error("Rejection failed");
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Administrator Dashboard</h2>
                <button className="btn btn-light rounded-pill px-4 shadow-sm" onClick={fetchPending}>
                    <i className="bi bi-arrow-clockwise me-2"></i> Refresh
                </button>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-primary mb-2"><i className="bi bi-people fs-3"></i></div>
                        <h6 className="text-muted small">Total Users</h6>
                        <h3 className="fw-bold mb-0">1,284</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-warning border-4">
                        <div className="text-warning mb-2"><i className="bi bi-person-plus fs-3"></i></div>
                        <h6 className="text-muted small">Pending Approvals</h6>
                        <h3 className="fw-bold mb-0">{pendingUsers.length}</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-success mb-2"><i className="bi bi-cash-coin fs-3"></i></div>
                        <h6 className="text-muted small">Monthly Revenue</h6>
                        <h3 className="fw-bold mb-0">$42,500</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="text-info mb-2"><i className="bi bi-map fs-3"></i></div>
                        <h6 className="text-muted small">Active Trips</h6>
                        <h3 className="fw-bold mb-0">86</h3>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white py-4 px-4 border-0">
                    <h5 className="mb-0 fw-bold">Pending Registrations</h5>
                    <p className="text-muted small mb-0">Review and approve new Agent or Hotel Owner applications.</p>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-muted small text-uppercase">
                                <tr>
                                    <th className="px-4 py-3">Applicant Name</th>
                                    <th>Contact Information</th>
                                    <th>Role</th>
                                    <th>Business Details</th>
                                    <th className="text-end px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status"></div>
                                        </td>
                                    </tr>
                                ) : pendingUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            <i className="bi bi-check-circle fs-2 text-success d-block mb-2"></i>
                                            All caught up! No pending registrations.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-4">
                                                <div className="fw-bold">{user.name}</div>
                                                <div className="small text-muted">Joined {new Date().toLocaleDateString()}</div>
                                            </td>
                                            <td>
                                                <div>{user.email}</div>
                                                <div className="small text-muted">{user.phone || 'No phone'}</div>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill ${user.role === 'AGENT' ? 'bg-info bg-opacity-10 text-info' : 'bg-warning bg-opacity-10 text-warning'} px-3`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="small">
                                                {user.role === 'AGENT' ? (
                                                    <div><i className="bi bi-vcard me-2"></i>License: {user.licenseNumber || 'N/A'}</div>
                                                ) : (
                                                    <div><i className="bi bi-building me-2"></i>Hotel: {user.hotelName || 'N/A'}</div>
                                                )}
                                            </td>
                                            <td className="text-end px-4">
                                                <button 
                                                    className="btn btn-success btn-sm rounded-pill px-3 me-2"
                                                    onClick={() => handleApprove(user.id)}
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                                    onClick={() => handleReject(user.id)}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
