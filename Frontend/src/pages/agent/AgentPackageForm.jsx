import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentPackageForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        packageName: '',
        destination: '',
        startPlace: '',
        endPlace: '',
        priceFrom: '',
        priceTo: '',
        duration: '',
        category: 'Adventure',
        imageUrl: '',
        festivalDetails: '',
        district: '',
        itinerary: [{ dayNumber: 1, title: '', description: '', activities: [] }]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchPackage();
        }
    }, [id]);

    const fetchPackage = async () => {
        try {
            setLoading(true);
            const data = await agentService.getPackage(id);
            setFormData(data);
        } catch (error) {
            toast.error("Failed to load package details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index][field] = value;
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const addDay = () => {
        setFormData({
            ...formData,
            itinerary: [...formData.itinerary, { dayNumber: formData.itinerary.length + 1, title: '', description: '', activities: [] }]
        });
    };

    const removeDay = (index) => {
        const newItinerary = formData.itinerary.filter((_, i) => i !== index);
        // Reset day numbers
        newItinerary.forEach((day, i) => day.dayNumber = i + 1);
        setFormData({ ...formData, itinerary: newItinerary });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit) {
                await agentService.updatePackage(user.userId, id, formData);
                toast.success("Package updated successfully");
            } else {
                await agentService.createPackage(user.userId, formData);
                toast.success("Package created and pending approval");
            }
            navigate('/agent/packages');
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isEdit ? 'Edit Package' : 'Create New Package'}</h2>
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => navigate('/agent/packages')}>
                    <i className="bi bi-arrow-left me-2"></i> Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit} className="row g-4">
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                        <h5 className="mb-4">Basic Information</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Package Name</label>
                                <input type="text" name="packageName" className="form-control rounded-3" value={formData.packageName} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Destination</label>
                                <input type="text" name="destination" className="form-control rounded-3" value={formData.destination} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">District</label>
                                <input type="text" name="district" className="form-control rounded-3" value={formData.district} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Start Place</label>
                                <input type="text" name="startPlace" className="form-control rounded-3" value={formData.startPlace} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">End Place</label>
                                <input type="text" name="endPlace" className="form-control rounded-3" value={formData.endPlace} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Price From ($)</label>
                                <input type="number" name="priceFrom" className="form-control rounded-3" value={formData.priceFrom} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Price To ($)</label>
                                <input type="number" name="priceTo" className="form-control rounded-3" value={formData.priceTo} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Duration (e.g. 3 Days 2 Nights)</label>
                                <input type="text" name="duration" className="form-control rounded-3" value={formData.duration} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Category</label>
                                <select name="category" className="form-select rounded-3" value={formData.category} onChange={handleChange}>
                                    <option value="Adventure">Adventure</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Beach">Beach</option>
                                    <option value="Wildlife">Wildlife</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Main Image URL</label>
                                <input type="text" name="imageUrl" className="form-control rounded-3" value={formData.imageUrl} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">Itinerary</h5>
                            <button type="button" className="btn btn-sm btn-primary rounded-pill" onClick={addDay}>
                                <i className="bi bi-plus-lg me-1"></i> Add Day
                            </button>
                        </div>

                        {formData.itinerary.map((day, index) => (
                            <div key={index} className="border-bottom pb-4 mb-4 last-child-border-0">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="text-primary mb-0">Day {day.dayNumber}</h6>
                                    {formData.itinerary.length > 1 && (
                                        <button type="button" className="btn btn-sm btn-outline-danger border-0" onClick={() => removeDay(index)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <input 
                                            type="text" 
                                            placeholder="Day Title" 
                                            className="form-control form-control-sm rounded-3" 
                                            value={day.title} 
                                            onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} 
                                            required 
                                        />
                                    </div>
                                    <div className="col-12">
                                        <textarea 
                                            placeholder="Description" 
                                            className="form-control form-control-sm rounded-3" 
                                            rows="2" 
                                            value={day.description} 
                                            onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} 
                                            required 
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{top: '20px'}}>
                        <h5 className="mb-4">Publishing</h5>
                        <div className="mb-4 p-3 bg-light rounded-3">
                            <p className="small text-muted mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                After submission, this package will be reviewed by administrators before becoming public.
                            </p>
                        </div>
                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-primary btn-lg rounded-pill" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                {isEdit ? 'Update Package' : 'Submit for Review'}
                            </button>
                            <button type="button" className="btn btn-light btn-lg rounded-pill" onClick={() => navigate('/agent/packages')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AgentPackageForm;
