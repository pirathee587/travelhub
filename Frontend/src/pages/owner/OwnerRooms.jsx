import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ownerService from '../../services/ownerService';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Modal as BSModal } from 'bootstrap';

const OwnerRooms = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        roomType: 'Standard',
        pricePerNight: '',
        capacity: 2,
        amenities: 'TV,AC,WiFi',
        totalRooms: 1,
        availableRooms: 1,
        imageUrl: ''
    });
    const [editingId, setEditingId] = useState(null);
    const modalRef = useRef();
    const bsModal = useRef();

    useEffect(() => {
        fetchRooms();
        bsModal.current = new BSModal(modalRef.current);
    }, [hotelId]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await ownerService.getRooms(hotelId);
            setRooms(data);
        } catch (error) {
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setFormData({
                roomType: room.roomType,
                pricePerNight: room.pricePerNight,
                capacity: room.capacity,
                amenities: room.amenities?.join(',') || '',
                totalRooms: room.totalRooms,
                availableRooms: room.availableRooms,
                imageUrl: room.imageUrl || ''
            });
            setEditingId(room.id);
        } else {
            setFormData({
                roomType: 'Standard',
                pricePerNight: '',
                capacity: 2,
                amenities: 'TV,AC,WiFi',
                totalRooms: 1,
                availableRooms: 1,
                imageUrl: ''
            });
            setEditingId(null);
        }
        bsModal.current.show();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, amenities: formData.amenities.split(',').map(s => s.trim()) };
            if (editingId) {
                await ownerService.updateRoom(hotelId, editingId, data);
                toast.success("Room updated");
            } else {
                await ownerService.createRoom(hotelId, data);
                toast.success("Room added");
            }
            bsModal.current.hide();
            fetchRooms();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this room category?")) return;
        try {
            await ownerService.deleteRoom(hotelId, id);
            toast.success("Room deleted");
            fetchRooms();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <button className="btn btn-sm btn-link text-decoration-none ps-0 mb-2" onClick={() => navigate('/owner/hotels')}>
                        <i className="bi bi-arrow-left me-1"></i> Back to Hotels
                    </button>
                    <h2>Room Management</h2>
                </div>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => handleOpenModal()}>
                    <i className="bi bi-plus-lg me-2"></i> Add Room Category
                </button>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : rooms.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted">No rooms added for this hotel yet.</p>
                    </div>
                ) : (
                    rooms.map(room => (
                        <div key={room.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <img src={room.imageUrl || 'https://via.placeholder.com/400x200?text=Room'} className="w-100 object-fit-cover" style={{height: '180px'}} alt="" />
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h5 className="fw-bold mb-0">{room.roomType}</h5>
                                        <span className="badge bg-primary rounded-pill px-3">${room.pricePerNight} / night</span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="small text-muted mb-2"><i className="bi bi-people me-2"></i> Capacity: {room.capacity} Persons</p>
                                        <p className="small text-muted mb-0"><i className="bi bi-door-closed me-2"></i> Inventory: {room.availableRooms} / {room.totalRooms} Available</p>
                                    </div>
                                    <div className="d-flex flex-wrap gap-1 mb-4">
                                        {room.amenities?.map((amenity, i) => (
                                            <span key={i} className="badge bg-light text-dark fw-normal rounded-pill px-2">{amenity}</span>
                                        ))}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-light flex-grow-1 rounded-pill btn-sm" onClick={() => handleOpenModal(room)}>Edit</button>
                                        <button className="btn btn-outline-danger flex-grow-1 rounded-pill btn-sm" onClick={() => handleDelete(room.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div ref={modalRef}>
                <Modal 
                    id="roomModal" 
                    title={editingId ? "Edit Room Category" : "Add Room Category"}
                    footer={
                        <>
                            <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" form="roomForm" className="btn btn-primary rounded-pill px-4">Save Changes</button>
                        </>
                    }
                >
                    <form id="roomForm" onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-8">
                                <label className="form-label">Room Type / Name</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.roomType} 
                                    onChange={(e) => setFormData({...formData, roomType: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Price ($)</label>
                                <input 
                                    type="number" 
                                    className="form-control rounded-3" 
                                    value={formData.pricePerNight} 
                                    onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Max Capacity</label>
                                <input 
                                    type="number" 
                                    className="form-control rounded-3" 
                                    value={formData.capacity} 
                                    onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Total Rooms</label>
                                <input 
                                    type="number" 
                                    className="form-control rounded-3" 
                                    value={formData.totalRooms} 
                                    onChange={(e) => setFormData({...formData, totalRooms: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Amenities (Comma separated)</label>
                                <input 
                                    type="text" 
                                    className="form-control rounded-3" 
                                    value={formData.amenities} 
                                    onChange={(e) => setFormData({...formData, amenities: e.target.value})} 
                                />
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

export default OwnerRooms;
