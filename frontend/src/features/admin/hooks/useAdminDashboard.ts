import { useState, useEffect } from 'react';
import adminDashboardApi from '../services/adminDashboardApi';

export const useAdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await adminDashboardApi
                .getDashboard();
            setDashboard(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    return { dashboard, loading, error,
             refetch: fetchDashboard };
};
