import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ownerService from '../../services/ownerService';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Modal as BSModal } from 'bootstrap';

const OwnerHotels = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Approved');
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        hotelName: '',
        district: '',
        businessAddress: '',
        businessRegistrationId: '',
        imageUrl: '',
        facilities: 'WiFi,Pool,Parking'
    });
    const [editingId, setEditingId] = useState(null);
    const modalRef = useRef();
    const bsModal = useRef();

    useEffect(() => {
        fetchHotels();
        bsModal.current = new BSModal(modalRef.current);
    }, [filter]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const data = await ownerService.getHotels(filter);
            setHotels(data);
        } catch (error) {
            toast.error("Failed to load hotels");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (hotel = null) => {
        if (hotel) {
            setFormData({
                hotelName: hotel.hotelName,
                district: hotel.district,
                businessAddress: hotel.businessAddress,
                businessRegistrationId: hotel.businessRegistrationId,
                imageUrl: hotel.imageUrl || '',
                facilities: hotel.facilities?.join(',') || 'WiFi,Pool,Parking'
            });
            setEditingId(hotel.id);
        } else {
            setFormData({
                hotelName: '',
                district: '',
                businessAddress: '',
                businessRegistrationId: '',
                imageUrl: '',
                facilities: 'WiFi,Pool,Parking'
            });
            setEditingId(null);
        }
        bsModal.current.show();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, facilities: formData.facilities.split(',').map(s => s.trim()) };
            if (editingId) {
                await ownerService.updateHotel(editingId, data);
                toast.success("Hotel updated");
            } else {
                await ownerService.createHotel(data);
                toast.success("Hotel registration submitted");
            }
            bsModal.current.hide();
            fetchHotels();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this hotel?")) return;
        try {
            await ownerService.deleteHotel(id);
            toast.success("Hotel deleted");
            fetchHotels();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Hotels</h2>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i> Register New Hotel
                </button>
            </div>

            <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-pill shadow-sm d-inline-flex">
                {['Approved', 'Pending', 'Rejected'].map(status => (
                    <li className="nav-item" key={status}>
                        <button 
                            className={`nav-link rounded-pill px-4 border-0 ${filter === status ? 'active' : 'text-muted'}`}
                            onClick={() => setFilter(status)}
                        >
                            {status}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : hotels.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted">No {filter.toLowerCase()} hotels found.</p>
                    </div>
                ) : (
                    hotels.map(hotel => (
                        <div key={hotel.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                <img src={hotel.imageUrl || 'https://via.placeholder.com/400x200?text=Hotel'} alt={hotel.hotelName} className="w-100 object-fit-cover" style={{height: '200px'}} />
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="mb-0 fw-bold">{hotel.hotelName}</h5>
                                        <div className="text-warning small">
                                            <i className="bi bi-star-fill"></i> {hotel.rating || 'N/A'}
                                        </div>
                                    </div>
                                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-2"></i>{hotel.district}</p>
                                    
                                    <div className="mb-4">
                                        <small className="text-muted d-block mb-2">Facilities</small>
                                        <div className="d-flex flex-wrap gap-2">
                                            {(hotel.facilities || ['WiFi', 'Pool', 'Parking']).slice(0, 3).map((f, i) => (
                                                <span key={i} className="badge bg-light text-dark fw-normal rounded-pill px-2">{f}</span>
                                            ))}
                                            {(hotel.facilities?.length > 3) && <span className="badge bg-light text-dark fw-normal rounded-pill px-2">+{hotel.facilities.length - 3}</span>}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-primary flex-grow-1 rounded-pill btn-sm" onClick={() => navigate(`/owner/hotels/${hotel.id}/rooms`)}>Manage Rooms</button>
                                        <button className="btn btn-light flex-grow-1 rounded-pill btn-sm" onClick={() => handleOpenModal(hotel)}>Edit Info</button>
                                        <button className="btn btn-outline-danger flex-grow-1 rounded-pill btn-sm" onClick={() => handleDelete(hotel.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div ref={modalRef}>
                <Modal 
                    id="hotelModal" 
                    title={editingId ? "Edit Hotel" : "Register Hotel"}
                    footer={
                        <>
                            <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="hotelForm" className="btn btn-primary rounded-pill px-4">Submit</button>
                        </>
                    }
                >
                    <form id="hotelForm" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Hotel Name</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                value={formData.hotelName} 
                                onChange={(e) => setFormData({...formData, hotelName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label">District</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.district} 
                                    onChange={(e) => setFormData({...formData, district: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Reg ID</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.businessRegistrationId} 
                                    onChange={(e) => setFormData({...formData, businessRegistrationId: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                value={formData.businessAddress} 
                                onChange={(e) => setFormData({...formData, businessAddress: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Facilities (Comma separated)</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                value={formData.facilities} 
                                onChange={(e) => setFormData({...formData, facilities: e.target.value})} 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Image URL</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                value={formData.imageUrl} 
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                            />
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default OwnerHotels;
