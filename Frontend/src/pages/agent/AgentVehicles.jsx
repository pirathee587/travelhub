import React, { useState, useEffect, useRef } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Modal as BSModal } from 'bootstrap';

const AgentVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        vehicleType: 'Sedan',
        registration: '',
        seats: 4,
        fuelType: 'Petrol',
        imageUrl: '',
        status: 'Available'
    });
    const [editingId, setEditingId] = useState(null);
    const modalRef = useRef();
    const bsModal = useRef();

    useEffect(() => {
        fetchVehicles();
        bsModal.current = new BSModal(modalRef.current);
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await agentService.getVehicles(user.userId);
            setVehicles(data);
        } catch (error) {
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setFormData({
                make: vehicle.make,
                model: vehicle.model,
                vehicleType: vehicle.vehicleType,
                registration: vehicle.registration,
                seats: vehicle.seats,
                fuelType: vehicle.fuelType,
                imageUrl: vehicle.imageUrl || '',
                status: vehicle.status
            });
            setEditingId(vehicle.id);
        } else {
            setFormData({
                make: '',
                model: '',
                vehicleType: 'Sedan',
                registration: '',
                seats: 4,
                fuelType: 'Petrol',
                imageUrl: '',
                status: 'Available'
            });
            setEditingId(null);
        }
        bsModal.current.show();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await agentService.updateVehicle(user.userId, editingId, formData);
                toast.success("Vehicle updated");
            } else {
                await agentService.createVehicle(user.userId, formData);
                toast.success("Vehicle added");
            }
            bsModal.current.hide();
            fetchVehicles();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vehicle?")) return;
        try {
            await agentService.deleteVehicle(user.userId, id);
            toast.success("Vehicle deleted");
            fetchVehicles();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Vehicles</h2>
                <button className="btn btn-info text-white rounded-pill px-4 shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-circle me-2"></i> Add New Vehicle
                </button>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : vehicles.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No vehicles registered.</div>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                <div className="card-body p-0">
                                    <img 
                                        src={vehicle.imageUrl || 'https://via.placeholder.com/400x200?text=Vehicle'} 
                                        alt={vehicle.model} 
                                        className="w-100 object-fit-cover" 
                                        style={{height: '180px'}}
                                    />
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="mb-0">{vehicle.make} {vehicle.model}</h5>
                                            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">{vehicle.vehicleType}</span>
                                        </div>
                                        <p className="text-muted small mb-3"><i className="bi bi-hash me-2"></i>{vehicle.registration}</p>
                                        
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <div className="bg-light rounded-3 p-2 text-center">
                                                    <small className="text-muted d-block">Seats</small>
                                                    <span className="fw-bold">{vehicle.seats}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="bg-light rounded-3 p-2 text-center">
                                                    <small className="text-muted d-block">Fuel</small>
                                                    <span className="fw-bold">{vehicle.fuelType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className={`small fw-medium text-${vehicle.status === 'Available' ? 'success' : 'warning'}`}>
                                                <i className={`bi bi-circle-fill me-2 fs-xs`}></i>{vehicle.status}
                                            </span>
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-outline-secondary rounded-start-pill px-3" onClick={() => handleOpenModal(vehicle)}>Edit</button>
                                                <button className="btn btn-sm btn-outline-danger rounded-end-pill px-3" onClick={() => handleDelete(vehicle.id)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div ref={modalRef}>
                <Modal 
                    id="vehicleModal" 
                    title={editingId ? "Edit Vehicle" : "Add Vehicle"}
                    footer={
                        <>
                            <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="vehicleForm" className="btn btn-info text-white rounded-pill px-4">Save Vehicle</button>
                        </>
                    }
                >
                    <form id="vehicleForm" onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Make</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.make} 
                                    onChange={(e) => setFormData({...formData, make: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Model</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.model} 
                                    onChange={(e) => setFormData({...formData, model: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Vehicle Type</label>
                                <select 
                                    className="form-select rounded-3" 
                                    value={formData.vehicleType} 
                                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                                >
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Van">Van</option>
                                    <option value="Bus">Bus</option>
                                    <option value="TukTuk">Tuk-Tuk</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Registration No.</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.registration} 
                                    onChange={(e) => setFormData({...formData, registration: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Seats</label>
                                <input 
                                    type="number" 
                                    className="form-control rounded-3" 
                                    value={formData.seats} 
                                    onChange={(e) => setFormData({...formData, seats: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Fuel Type</label>
                                <select 
                                    className="form-select rounded-3" 
                                    value={formData.fuelType} 
                                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                                >
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label">Image URL</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.imageUrl} 
                                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                                />
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default AgentVehicles;
