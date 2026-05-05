// ============================================
// REAL-WORLD USAGE EXAMPLES
// ============================================

// ──────────────────────────────────────────
// Example 1: Dashboard Page
// ──────────────────────────────────────────

import { useAdminDashboard } from '@/hooks/admin';
import StatsCard from '@/components/StatsCard';
import ChartCard from '@/components/ChartCard';

const Dashboard = () => {
    const { dashboard, loading, error, refetch } = useAdminDashboard();

    if (loading) return <div className="p-6">Loading dashboard...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6 bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button
                    onClick={refetch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatsCard
                    title="Total Users"
                    value={dashboard?.totalUsers}
                    icon="👥"
                />
                <StatsCard
                    title="Total Agents"
                    value={dashboard?.totalAgents}
                    icon="🧑‍💼"
                />
                <StatsCard
                    title="Total Hotels"
                    value={dashboard?.totalHotels}
                    icon="🏨"
                />
                <StatsCard
                    title="Monthly Revenue"
                    value={`$${dashboard?.monthlyRevenue}`}
                    icon="💰"
                />
            </div>

            {/* Pending Approvals Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <h3 className="font-bold text-yellow-800 mb-3">
                    ⚠️ Pending Approvals
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded">
                        <p className="text-gray-500 text-sm">Pending Agents</p>
                        <p className="text-2xl font-bold text-red-600">
                            {dashboard?.pendingAgents}
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <p className="text-gray-500 text-sm">Pending Hotels</p>
                        <p className="text-2xl font-bold text-red-600">
                            {dashboard?.pendingHotels}
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <p className="text-gray-500 text-sm">Pending Packages</p>
                        <p className="text-2xl font-bold text-red-600">
                            {dashboard?.pendingPackages}
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <p className="text-gray-500 text-sm">Pending Bookings</p>
                        <p className="text-2xl font-bold text-red-600">
                            {dashboard?.pendingBookings}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <ChartCard
                    title="Booking Trends"
                    labels={dashboard?.trendLabels}
                    data={dashboard?.trendData}
                />
                <ChartCard
                    title="Revenue Overview"
                    labels={dashboard?.revenueLabels}
                    data={dashboard?.revenueData}
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded shadow mb-8">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">Recent Activity</h3>
                </div>
                <div className="divide-y">
                    {dashboard?.recentActivity?.map((item, i) => (
                        <div key={i} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.subtitle}</p>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`px-3 py-1 rounded text-sm font-semibold ${
                                        item.status === 'success'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {item.status}
                                </span>
                                <p className="text-xs text-gray-400 mt-1">
                                    {item.timeAgo}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Package Distribution */}
            <div className="bg-white rounded shadow">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">Package Distribution</h3>
                </div>
                <div className="p-4 space-y-3">
                    {dashboard?.packageDistribution?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="font-semibold">{item.category}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span>{item.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


// ──────────────────────────────────────────
// Example 2: Agent Approvals Page
// ──────────────────────────────────────────

import { useAdminUsers } from '@/hooks/admin';
import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import AgentDetailsView from '@/components/AgentDetailsView';

const AgentApprovals = () => {
    const {
        users,
        loading,
        error,
        approveAgent,
        rejectAgent,
        refetch
    } = useAdminUsers();

    const [selectedAgent, setSelectedAgent] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [actionType, setActionType] = useState(null);

    // Filter only pending agents
    const pendingAgents = users.filter(u => u.role === 'AGENT' && u.status === 'pending');

    const handleApprove = async (id) => {
        try {
            await approveAgent(id);
            // Show success toast
            console.log('Agent approved successfully');
        } catch (err) {
            console.error('Failed to approve agent:', err);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectAgent(id, rejectReason);
            setRejectReason('');
            setShowConfirm(false);
            // Show success toast
            console.log('Agent rejected successfully');
        } catch (err) {
            console.error('Failed to reject agent:', err);
        }
    };

    if (loading) return <div className="p-6">Loading agents...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Agent Approvals ({pendingAgents.length})
                </h1>
                <button
                    onClick={refetch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Refresh
                </button>
            </div>

            {pendingAgents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No pending agents for approval
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingAgents.map(agent => (
                        <div
                            key={agent.id}
                            className="bg-white border rounded-lg shadow hover:shadow-lg transition p-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{agent.name}</h3>
                                    <p className="text-gray-600">{agent.email}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Applied: {agent.createdAt}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedAgent(agent)}
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                    >
                                        View Details
                                    </button>

                                    <button
                                        onClick={() => handleApprove(agent.id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                    >
                                        ✓ Approve
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedAgent(agent);
                                            setActionType('reject');
                                            setShowConfirm(true);
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        ✕ Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Agent Details Modal */}
            {selectedAgent && actionType !== 'reject' && (
                <AgentDetailsView
                    agent={selectedAgent}
                    onClose={() => setSelectedAgent(null)}
                />
            )}

            {/* Reject Confirmation Modal */}
            {showConfirm && actionType === 'reject' && (
                <ConfirmModal
                    title="Reject Agent"
                    message="Please provide a reason for rejection:"
                    isOpen={showConfirm}
                    onConfirm={() => handleReject(selectedAgent.id)}
                    onCancel={() => {
                        setShowConfirm(false);
                        setRejectReason('');
                    }}
                >
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        className="w-full p-2 border rounded mt-4"
                        rows="4"
                    />
                </ConfirmModal>
            )}
        </div>
    );
};

export default AgentApprovals;


// ──────────────────────────────────────────
// Example 3: Payment Management Page
// ──────────────────────────────────────────

import { useAdminPayments } from '@/hooks/admin';
import { useState } from 'react';

const Payments = () => {
    const {
        payments,
        stats,
        loading,
        error,
        updatePaymentStatus,
        refetch
    } = useAdminPayments();

    const [filterType, setFilterType] = useState('All Types');
    const [filterStatus, setFilterStatus] = useState('All Status');

    const handleStatusChange = async (paymentId, newStatus) => {
        try {
            await updatePaymentStatus(paymentId, newStatus);
            console.log('Payment status updated');
        } catch (err) {
            console.error('Failed to update payment status:', err);
        }
    };

    if (loading) return <div className="p-6">Loading payments...</div>;

    return (
        <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                        ${stats?.totalRevenue}
                    </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-gray-600 text-sm">Pending Payments</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        ${stats?.pendingPayments}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-gray-600 text-sm">Refunds</p>
                    <p className="text-3xl font-bold text-red-600">
                        ${stats?.refunds}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option>All Types</option>
                    <option>Payment</option>
                    <option>Refund</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option>All Status</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                </select>

                <button
                    onClick={refetch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Refresh
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Date
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payments?.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm">{payment.id}</td>
                                <td className="px-6 py-3 text-sm font-semibold">
                                    ${payment.amount}
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                            payment.type === 'Payment'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                        }`}
                                    >
                                        {payment.type}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    <select
                                        value={payment.status}
                                        onChange={(e) =>
                                            handleStatusChange(
                                                payment.id,
                                                e.target.value
                                            )
                                        }
                                        className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${
                                            payment.status === 'Completed'
                                                ? 'bg-green-100 text-green-800'
                                                : payment.status === 'Pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        <option>Completed</option>
                                        <option>Pending</option>
                                        <option>Failed</option>
                                    </select>
                                </td>
                                <td className="px-6 py-3 text-sm">
                                    {payment.createdAt}
                                </td>
                                <td className="px-6 py-3 text-center text-sm">
                                    <button className="text-blue-500 hover:text-blue-700">
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;


// ──────────────────────────────────────────
// Example 4: Using API Directly
// ──────────────────────────────────────────

import { adminAgentApi } from '@/api/admin';
import { useState } from 'react';

const AgentStatsPage = ({ agentId }) => {
    const [stats, setStats] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [tripStatus, setTripStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, revenueRes, tripRes] = await Promise.all([
                    adminAgentApi.getAgentStats(agentId),
                    adminAgentApi.getAgentRevenue(agentId, 2024),
                    adminAgentApi.getAgentTripStatus(agentId),
                ]);

                setStats(statsRes.data);
                setRevenue(revenueRes.data);
                setTripStatus(tripRes.data);
            } catch (err) {
                console.error('Failed to fetch agent data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agentId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>{stats?.agentName}</h2>
            <p>Total Trips: {stats?.totalTrips}</p>
            <p>Revenue: ${revenue?.total}</p>
        </div>
    );
};

export default AgentStatsPage;
