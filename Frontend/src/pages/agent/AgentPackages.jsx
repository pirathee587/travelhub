import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await agentService.getPackages(user.userId);
            setPackages(data);
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?")) return;
        try {
            await agentService.deletePackage(id);
            toast.success("Package deleted");
            fetchPackages();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Packages</h2>
                <Link to="/agent/packages/new" className="btn btn-primary rounded-pill px-4">
                    <i className="bi bi-plus-lg me-2"></i> Create New Package
                </Link>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4">Package Name</th>
                                <th>Destination</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th className="text-end px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                            ) : packages.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No packages found.</td></tr>
                            ) : (
                                packages.map(pkg => (
                                    <tr key={pkg.id}>
                                        <td className="px-4 fw-bold">{pkg.packageName}</td>
                                        <td>{pkg.destination}</td>
                                        <td>${pkg.price}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${pkg.active ? 'bg-success' : 'bg-secondary'} bg-opacity-10 text-${pkg.active ? 'success' : 'secondary'} px-3`}>
                                                {pkg.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-end px-4">
                                            <button className="btn btn-sm btn-outline-info me-2 rounded-circle" onClick={() => navigate(`/agent/packages/edit/${pkg.id}`)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => handleDelete(pkg.id)}>
                                                <i className="bi bi-trash"></i>
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
    );
};

export default AgentPackages;
