import { useState, useEffect } from 'react';
import adminUserApi from '../services/adminUserApi';

export const useAdminUsers = () => {
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminUserApi.getAllUsers();
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const approveAgent = async (id) => {
        await adminUserApi.approveAgent(id);
        fetchUsers();
    };

    const rejectAgent = async (id, reason) => {
        await adminUserApi.rejectAgent(id, reason);
        fetchUsers();
    };

    const toggleActive = async (id) => {
        await adminUserApi.toggleUserActive(id);
        fetchUsers();
    };

    const deleteUser = async (id) => {
        await adminUserApi.deleteUser(id);
        fetchUsers();
    };

    return {
        users, loading, error,
        approveAgent, rejectAgent,
        toggleActive, deleteUser,
        refetch: fetchUsers,
    };
};
