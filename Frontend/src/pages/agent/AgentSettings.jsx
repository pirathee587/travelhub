import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentSettings = () => {
    const [settings, setSettings] = useState({
        agentName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        licenseNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await agentService.getProfile(user.userId);
            setSettings(data);
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await agentService.updateProfile(user.userId, settings);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Profile Settings</h2>
            
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 text-center p-4">
                        <div className="mb-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
                                <i className="bi bi-person-circle text-primary fs-1"></i>
                            </div>
                            <h5 className="fw-bold mb-1">{settings.agentName}</h5>
                            <p className="text-muted small">Agent ID: {user.userId}</p>
                        </div>
                        <div className="d-grid">
                            <button className="btn btn-outline-primary rounded-pill btn-sm">Change Profile Picture</button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4">
                        <form onSubmit={handleSubmit}>
                            <h5 className="mb-4 fw-bold">Personal Information</h5>
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={settings.agentName} 
                                        onChange={(e) => setSettings({...settings, agentName: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Company Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={settings.companyName} 
                                        onChange={(e) => setSettings({...settings, companyName: e.target.value})} 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="form-control rounded-3 bg-light" 
                                        value={settings.email} 
                                        readOnly 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={settings.phone} 
                                        onChange={(e) => setSettings({...settings, phone: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Business Address</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3" 
                                        value={settings.address} 
                                        onChange={(e) => setSettings({...settings, address: e.target.value})} 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Bio / Description</label>
                                    <textarea 
                                        className="form-control rounded-3" 
                                        rows="3" 
                                        value={settings.bio} 
                                        onChange={(e) => setSettings({...settings, bio: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>

                            <h5 className="mb-4 fw-bold">Identification</h5>
                            <div className="row g-3 mb-5">
                                <div className="col-md-6">
                                    <label className="form-label">License Number</label>
                                    <input 
                                        type="text" 
                                        className="form-control rounded-3 bg-light" 
                                        value={settings.licenseNumber} 
                                        readOnly 
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn btn-light rounded-pill px-4" onClick={fetchSettings}>Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentSettings;
