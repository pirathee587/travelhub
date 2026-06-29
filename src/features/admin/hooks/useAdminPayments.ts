import { useState, useEffect } from 'react';
import adminPaymentApi from '../services/adminPaymentApi';

export const useAdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats]       = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, []);

    const fetchPayments = async (type, status) => {
        try {
            setLoading(true);
            const res = await adminPaymentApi
                .getAllPayments(type, status);
            setPayments(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await adminPaymentApi
                .getPaymentStats();
            setStats(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load payment stats');
        }
    };

    const updatePaymentStatus = async (id, status) => {
        await adminPaymentApi
            .updatePaymentStatus(id, status);
        fetchPayments();
    };

    return {
        payments, stats, loading, error,
        updatePaymentStatus,
        refetch: fetchPayments,
    };
};
