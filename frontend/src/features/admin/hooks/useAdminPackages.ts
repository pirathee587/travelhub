import { useState, useEffect } from 'react';
import adminPackageApi
    from '../services/adminPackageApi';

export const useAdminPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const res = await adminPackageApi
                .getAllPackages();
            setPackages(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const approvePackage = async (id) => {
        await adminPackageApi.approvePackage(id);
        fetchPackages();
    };

    const rejectPackage = async (id, reason) => {
        await adminPackageApi.rejectPackage(id, reason);
        fetchPackages();
    };

    const deletePackage = async (id) => {
        await adminPackageApi.deletePackage(id);
        fetchPackages();
    };

    return {
        packages, loading, error,
        approvePackage, rejectPackage, deletePackage,
        refetch: fetchPackages,
    };
};
