import { useState, useEffect } from 'react';
import adminAgentApi from '../services/adminAgentApi';

export const useAdminAgents = () => {
    const [agents, setAgents]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await adminAgentApi.getAllAgents();
            setAgents(res.data);
        } catch (err) {
            setError(err.response?.data?.message
                || 'Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const approveAgent = async (id) => {
        await adminAgentApi.approveAgent(id);
        fetchAgents();
    };

    const rejectAgent = async (id, reason) => {
        await adminAgentApi.rejectAgent(id, reason);
        fetchAgents();
    };

    const toggleActive = async (id) => {
        await adminAgentApi.toggleAgentActive(id);
        fetchAgents();
    };

    const deleteAgent = async (id) => {
        await adminAgentApi.deleteAgent(id);
        fetchAgents();
    };

    return {
        agents, loading, error,
        approveAgent, rejectAgent,
        toggleActive, deleteAgent,
        refetch: fetchAgents,
    };
};
