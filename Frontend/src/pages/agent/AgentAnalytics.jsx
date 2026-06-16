import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('monthly');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await agentService.getAnalytics(user.userId, period);
            setAnalytics(data);
        } catch (error) {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Performance Analytics</h2>
                <select 
                    className="form-select w-auto rounded-pill border-0 shadow-sm px-4"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <h6 className="text-muted small mb-1">Total Revenue</h6>
                        <h3 className="fw-bold text-primary">${analytics?.totalRevenue?.toLocaleString()}</h3>
                        <span className="text-success small"><i className="bi bi-graph-up me-1"></i> +12%</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <h6 className="text-muted small mb-1">Total Trips</h6>
                        <h3 className="fw-bold text-success">{analytics?.totalTrips}</h3>
                        <span className="text-success small"><i className="bi bi-graph-up me-1"></i> +5%</span>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <h6 className="text-muted small mb-1">Avg Rating</h6>
                        <h3 className="fw-bold text-warning">{analytics?.averageRating?.toFixed(1)}</h3>
                        <div className="text-warning small">
                            {[1,2,3,4,5].map(s => <i key={s} className={`bi bi-star${s <= analytics?.averageRating ? '-fill' : ''}`}></i>)}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                        <h6 className="text-muted small mb-1">Cancel Rate</h6>
                        <h3 className="fw-bold text-danger">{analytics?.cancellationRate?.toFixed(1)}%</h3>
                        <span className="text-muted small">Target &lt; 2%</span>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Revenue Trend</h5>
                        </div>
                        <div className="card-body py-5 text-center">
                            <div className="text-muted small mb-4">[ Revenue Chart Placeholder ]</div>
                            <div className="d-flex justify-content-center gap-3">
                                {analytics?.revenueData?.map((d, i) => (
                                    <div key={i} className="bg-primary bg-opacity-25 rounded-top" style={{width: '30px', height: `${(d.value / 1000) * 10}px`}}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="mb-0">Trip Status Distribution</h5>
                        </div>
                        <div className="card-body py-5 text-center">
                            <div className="text-muted small mb-4">[ Pie Chart Placeholder ]</div>
                            <div className="d-flex justify-content-center gap-4">
                                <div className="small"><i className="bi bi-circle-fill text-success me-2"></i>Completed</div>
                                <div className="small"><i className="bi bi-circle-fill text-primary me-2"></i>Active</div>
                                <div className="small"><i className="bi bi-circle-fill text-warning me-2"></i>Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0">Driver Performance</h5>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4">Driver Name</th>
                                    <th>Trips</th>
                                    <th>Rating</th>
                                    <th className="text-end px-4">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics?.driverPerformance?.map((d, i) => (
                                    <tr key={i}>
                                        <td className="px-4 fw-bold">{d.name}</td>
                                        <td>{d.trips}</td>
                                        <td><i className="bi bi-star-fill text-warning me-1"></i> {d.rating}</td>
                                        <td className="text-end px-4">
                                            <div className="progress rounded-pill" style={{height: '8px', width: '100px', marginLeft: 'auto'}}>
                                                <div className="progress-bar bg-success" style={{width: `${d.efficiency}%`}}></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentAnalytics;
