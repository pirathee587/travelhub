import React, { useState, useEffect, useRef } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Modal as BSModal } from 'bootstrap';

const AgentDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        status: 'Active'
    });
    const [editingId, setEditingId] = useState(null);
    const modalRef = useRef();
    const bsModal = useRef();

    useEffect(() => {
        fetchDrivers();
        bsModal.current = new BSModal(modalRef.current);
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const data = await agentService.getDrivers(user.userId);
            setDrivers(data);
        } catch (error) {
            toast.error("Failed to load drivers");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (driver) => {
        const newStatus = driver.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await agentService.updateDriverStatus(user.userId, driver.id, newStatus);
            toast.success(`Driver ${newStatus}`);
            fetchDrivers();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleOpenModal = (driver = null) => {
        if (driver) {
            setFormData({
                name: driver.name,
                email: driver.email || '',
                phone: driver.phone,
                licenseNumber: driver.licenseNumber,
                status: driver.status
            });
            setEditingId(driver.id);
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                licenseNumber: '',
                status: 'Active'
            });
            setEditingId(null);
        }
        bsModal.current.show();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await agentService.updateDriver(user.userId, editingId, formData);
                toast.success("Driver updated");
            } else {
                await agentService.createDriver(user.userId, formData);
                toast.success("Driver registered");
            }
            bsModal.current.hide();
            fetchDrivers();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this driver?")) return;
        try {
            await agentService.deleteDriver(user.userId, id);
            toast.success("Driver deleted");
            fetchDrivers();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Drivers</h2>
                <button className="btn btn-success rounded-pill px-4" onClick={() => handleOpenModal()}>
                    <i className="bi bi-person-plus me-2"></i> Register New Driver
                </button>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : drivers.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No drivers registered.</div>
                ) : (
                    drivers.map(driver => (
                        <div key={driver.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                                <i className="bi bi-person-vcard fs-3 text-primary"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h5 className="mb-0">{driver.name}</h5>
                                            <p className="small text-muted mb-0">{driver.licenseNumber}</p>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                checked={driver.status === 'Active'} 
                                                onChange={() => handleStatusToggle(driver)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted"><i className="bi bi-telephone me-2"></i> Phone</span>
                                            <span>{driver.phone}</span>
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span className="text-muted"><i className="bi bi-star me-2"></i> Rating</span>
                                            <span className="fw-bold">{driver.rating?.toFixed(1) || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-light flex-grow-1 rounded-pill" onClick={() => handleOpenModal(driver)}>Edit</button>
                                        <button className="btn btn-sm btn-outline-danger flex-grow-1 rounded-pill" onClick={() => handleDelete(driver.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div ref={modalRef}>
                <Modal 
                    id="driverModal" 
                    title={editingId ? "Edit Driver" : "Register Driver"}
                    footer={
                        <>
                            <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="driverForm" className="btn btn-primary rounded-pill px-4">Save Driver</button>
                        </>
                    }
                >
                    <form id="driverForm" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email (Optional)</label>
                            <input 
                                type="email" 
                                className="form-control rounded-3" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Phone Number</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">License Number</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.licenseNumber} 
                                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default AgentDrivers;
