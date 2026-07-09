import { useState, useEffect } from 'react';
import adminHotelApi from '../services/adminHotelApi';

export const useAdminHotels = () => {
    const [hotels, setHotels]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const res = await adminHotelApi.getAllHotels();
            setHotels(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load hotels');
        } finally {
            setLoading(false);
        }
    };

    const approveHotel = async (id) => {
        await adminHotelApi.approveHotel(id);
        fetchHotels();
    };

    const rejectHotel = async (id, reason) => {
        await adminHotelApi.rejectHotel(id, reason);
        fetchHotels();
    };

    const deleteHotel = async (id) => {
        await adminHotelApi.deleteHotel(id);
        fetchHotels();
    };

    return {
        hotels, loading, error,
        approveHotel, rejectHotel, deleteHotel,
        refetch: fetchHotels,
    };
};
