import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SearchPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        fetchPackages();
    }, [category]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/packages', { params: { category } });
            setPackages(response.data);
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const filteredPackages = packages.filter(pkg => 
        pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 rounded-start-pill px-3">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 rounded-end-pill shadow-none" 
                                placeholder="Search destinations or packages..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6 d-flex gap-2 justify-content-md-end">
                        <select 
                            className="form-select w-auto rounded-pill border-0 bg-light px-4"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Beach">Beach</option>
                            <option value="Wildlife">Wildlife</option>
                            <option value="Luxury">Luxury</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : filteredPackages.length === 0 ? (
                    <div className="col-12 text-center py-5">
                        <i className="bi bi-emoji-frown fs-1 text-muted mb-3 d-block"></i>
                        <p className="text-muted">No packages found matching your criteria.</p>
                    </div>
                ) : (
                    filteredPackages.map(pkg => (
                        <div key={pkg.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="position-relative">
                                    <img 
                                        src={pkg.imageUrl || 'https://via.placeholder.com/400x250?text=Package'} 
                                        alt={pkg.packageName} 
                                        className="w-100 object-fit-cover" 
                                        style={{height: '200px'}}
                                    />
                                    {pkg.trending && (
                                        <span className="position-absolute top-0 end-0 m-3 badge bg-danger rounded-pill shadow-sm">
                                            <i className="bi bi-fire me-1"></i> Trending
                                        </span>
                                    )}
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className="card-title fw-bold mb-0">{pkg.packageName}</h5>
                                        <div className="text-warning small fw-bold">
                                            <i className="bi bi-star-fill me-1"></i>{pkg.rating?.toFixed(1) || '0.0'}
                                        </div>
                                    </div>
                                    <p className="text-muted small mb-3"><i className="bi bi-geo-alt me-2"></i>{pkg.destination}, {pkg.district}</p>
                                    
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <span className="text-muted small"><i className="bi bi-clock me-2"></i>{pkg.duration}</span>
                                        <span className="badge bg-light text-dark fw-normal rounded-pill px-3">{pkg.category}</span>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                                        <div>
                                            <small className="text-muted d-block">Price starting from</small>
                                            <span className="h5 fw-bold text-primary mb-0">${pkg.priceFrom}</span>
                                        </div>
                                        <Link to={`/packages/${pkg.id}`} className="btn btn-primary rounded-pill px-4">View Details</Link>
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

export default SearchPackages;
