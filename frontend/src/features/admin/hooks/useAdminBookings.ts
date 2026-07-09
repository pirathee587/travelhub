import { useState, useEffect } from 'react';
import adminBookingApi from '../services/adminBookingApi';

export const useAdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await adminBookingApi
                .getAllBookings();
            setBookings(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (id, status) => {
        await adminBookingApi
            .updateBookingStatus(id, status);
        fetchBookings();
    };

    return {
        bookings, loading, error,
        updateBookingStatus,
        refetch: fetchBookings,
    };
};
