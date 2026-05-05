import React, { useState, useEffect } from 'react';
import touristService from '../../services/touristService';
import toast from 'react-hot-toast';

const TouristDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await touristService.getDocuments(user.userId);
            setDocuments(data);
        } catch (error) {
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'passport': return 'bi-file-person';
            case 'visa': return 'bi-file-earmark-check';
            case 'ticket': return 'bi-ticket-perforated';
            default: return 'bi-file-earmark';
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Travel Documents</h2>
                <button className="btn btn-primary rounded-pill px-4 shadow-sm">
                    <i className="bi bi-upload me-2"></i> Upload New
                </button>
            </div>

            <div className="alert alert-info border-0 rounded-4 shadow-sm mb-4">
                <div className="d-flex">
                    <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                    <div>
                        <h6 className="fw-bold mb-1">Document Safety</h6>
                        <p className="small mb-0 opacity-75">Your documents are encrypted and only accessible by you and your assigned travel agents during your trips.</p>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : documents.length === 0 ? (
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
                            <div className="card-body">
                                <i className="bi bi-folder2-open fs-1 text-muted mb-3 d-block"></i>
                                <h5>No Documents Found</h5>
                                <p className="text-muted">Upload your passport, visa, and tickets for easy access during travel.</p>
                                <button className="btn btn-outline-primary rounded-pill px-4 mt-2">Upload First Document</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="flex-shrink-0 bg-light rounded-3 p-3">
                                            <i className={`bi ${getIcon(doc.type)} fs-3 text-primary`}></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <h6 className="mb-0 fw-bold">{doc.title}</h6>
                                            <span className="text-muted small">{doc.type}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center small mb-4">
                                        <span className="text-muted">Expiry Date</span>
                                        <span className={`fw-medium ${new Date(doc.expiry) < new Date() ? 'text-danger' : ''}`}>
                                            {doc.expiry}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary flex-grow-1 rounded-pill btn-sm">View File</button>
                                        <button className="btn btn-light rounded-circle btn-sm"><i className="bi bi-download"></i></button>
                                        <button className="btn btn-outline-danger border-0 rounded-circle btn-sm"><i className="bi bi-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TouristDocuments;
