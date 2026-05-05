import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        switch (user.role) {
            case 'ADMIN':
                navigate('/admin/dashboard');
                break;
            case 'AGENT':
                navigate('/agent/dashboard');
                break;
            case 'HOTEL_OWNER':
                navigate('/owner/dashboard');
                break;
            case 'TOURIST':
                navigate('/tourist/dashboard');
                break;
            default:
                navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Redirecting to your dashboard...</p>
        </div>
    );
};

export default Dashboard;
