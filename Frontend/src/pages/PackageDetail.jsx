import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PackageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchPackage();
    }, [id]);

    const fetchPackage = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/packages/${id}`);
            setPkg(response.data);
        } catch (error) {
            toast.error("Failed to load package details");
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = () => {
        if (!user) {
            toast.error("Please login to book a package");
            navigate('/login');
            return;
        }
        // Redirect to booking flow (to be implemented)
        toast.success("Redirecting to booking...");
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (!pkg) return <div className="text-center mt-5">Package not found</div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <img src={pkg.imageUrl || 'https://via.placeholder.com/800x400'} className="w-100 object-fit-cover" style={{height: '400px'}} alt="" />
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h1 className="fw-bold mb-0">{pkg.packageName}</h1>
                                <div className="text-warning h4 mb-0">
                                    <i className="bi bi-star-fill me-2"></i>{pkg.rating?.toFixed(1)}
                                    <span className="text-muted small ms-2 fw-normal">({pkg.reviewCount} reviews)</span>
                                </div>
                            </div>
                            <p className="text-muted mb-4 fs-5"><i className="bi bi-geo-alt me-2 text-primary"></i>{pkg.destination}, {pkg.district}</p>
                            
                            <div className="row g-3 mb-5 text-center">
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded-4 h-100">
                                        <i className="bi bi-clock fs-3 text-primary mb-2 d-block"></i>
                                        <div className="small text-muted">Duration</div>
                                        <div className="fw-bold">{pkg.duration}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded-4 h-100">
                                        <i className="bi bi-tag fs-3 text-primary mb-2 d-block"></i>
                                        <div className="small text-muted">Category</div>
                                        <div className="fw-bold">{pkg.category}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded-4 h-100">
                                        <i className="bi bi-people fs-3 text-primary mb-2 d-block"></i>
                                        <div className="small text-muted">Agent</div>
                                        <div className="fw-bold">{pkg.agentName}</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="p-3 bg-light rounded-4 h-100">
                                        <i className="bi bi-geo fs-3 text-primary mb-2 d-block"></i>
                                        <div className="small text-muted">Start Point</div>
                                        <div className="fw-bold">{pkg.startPlace}</div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="fw-bold mb-4">Detailed Itinerary</h4>
                            <div className="itinerary-list ps-3 border-start border-primary border-2">
                                {pkg.itinerary?.map((day, i) => (
                                    <div key={i} className="mb-5 position-relative">
                                        <div className="position-absolute translate-middle-x" style={{left: '-17px', top: '5px'}}>
                                            <div className="bg-primary rounded-circle" style={{width: '12px', height: '12px'}}></div>
                                        </div>
                                        <h5 className="fw-bold text-primary">Day {day.dayNumber}: {day.title}</h5>
                                        <p className="text-muted mb-3">{day.description}</p>
                                        <div className="d-flex flex-wrap gap-2">
                                            {day.activities?.map((act, j) => (
                                                <span key={j} className="badge bg-white text-primary border border-primary fw-normal rounded-pill px-3 py-2">{act}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{top: '20px'}}>
                        <div className="mb-4">
                            <small className="text-muted d-block mb-1">Starting from</small>
                            <div className="d-flex align-items-baseline gap-2">
                                <span className="h1 fw-bold text-primary mb-0">${pkg.priceFrom}</span>
                                <span className="text-muted">/ person</span>
                            </div>
                        </div>

                        <div className="p-3 bg-primary bg-opacity-10 rounded-4 mb-4">
                            <h6 className="fw-bold text-primary mb-2"><i className="bi bi-shield-check me-2"></i>Best Price Guarantee</h6>
                            <p className="small text-muted mb-0">Found a better price? We'll match it and give you an extra 5% off.</p>
                        </div>

                        <div className="d-grid gap-3">
                            <button className="btn btn-primary btn-lg rounded-pill py-3 fw-bold" onClick={handleBookNow}>Book This Trip</button>
                            <button className="btn btn-outline-secondary rounded-pill py-3 fw-bold">Inquiry Now</button>
                        </div>

                        <hr className="my-4" />

                        <h6 className="fw-bold mb-3">Package Highlights</h6>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2 small"><i className="bi bi-check2-circle text-success me-2"></i> Professional Local Guide</li>
                            <li className="mb-2 small"><i className="bi bi-check2-circle text-success me-2"></i> Premium Transport</li>
                            <li className="mb-2 small"><i className="bi bi-check2-circle text-success me-2"></i> Hotel Pickups & Drops</li>
                            <li className="small"><i className="bi bi-check2-circle text-success me-2"></i> All Entrance Fees Included</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDetail;
