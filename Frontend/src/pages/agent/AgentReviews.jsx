import React, { useState, useEffect } from 'react';
import agentService from '../../services/agentService';
import toast from 'react-hot-toast';

const AgentReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({});
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await agentService.getReviews(user.userId);
            setReviews(data);
        } catch (error) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (reviewId) => {
        const reply = replyText[reviewId];
        if (!reply || !reply.trim()) return;

        try {
            await agentService.replyToReview(user.userId, reviewId, reply);
            toast.success("Reply posted");
            setReplyText({ ...replyText, [reviewId]: '' });
            fetchReviews();
        } catch (error) {
            toast.error("Failed to post reply");
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <i key={i} className={`bi bi-star-fill ${i < rating ? 'text-warning' : 'text-light'}`}></i>
        ));
    };

    return (
        <div className="container mt-4 mb-5">
            <h2 className="mb-4">Guest Reviews</h2>

            <div className="row g-4">
                {loading ? (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : reviews.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">No reviews received yet.</div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-3 me-3">
                                            <i className="bi bi-person fs-4 text-primary"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-1 fw-bold">{review.touristName}</h6>
                                            <div className="small text-muted">{review.date} • {review.packageName}</div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="mb-1">{renderStars(review.rating)}</div>
                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">{review.rating}.0</span>
                                    </div>
                                </div>
                                
                                <p className="mb-4">"{review.comment}"</p>

                                {review.reply ? (
                                    <div className="bg-light p-3 rounded-4 border-start border-primary border-4 ms-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="fw-bold text-primary">Your Reply</small>
                                            <small className="text-muted">{review.replyDate}</small>
                                        </div>
                                        <p className="small mb-0">{review.reply}</p>
                                    </div>
                                ) : (
                                    <div className="ms-4">
                                        <textarea 
                                            className="form-control rounded-4 border-light bg-light small mb-2" 
                                            placeholder="Write a professional reply..." 
                                            rows="2"
                                            value={replyText[review.id] || ''}
                                            onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                        ></textarea>
                                        <div className="text-end">
                                            <button 
                                                className="btn btn-primary btn-sm rounded-pill px-4"
                                                onClick={() => handleReply(review.id)}
                                                disabled={!replyText[review.id]}
                                            >
                                                Post Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AgentReviews;
