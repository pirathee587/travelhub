import api from '@/services/axios';

const adminDashboardApi = {

    // GET /api/admin/dashboard
    // Returns: AdminDashboardResponse {
    //   totalUsers, totalTourists, totalAgents, totalHotelManagers,
    //   totalHotels, totalPackages, totalBookings, totalReviews,
    //   pendingAgents, pendingBookings, pendingHotels, pendingPackages,
    //   totalRevenue
    // }
    getDashboard: async () => {
        const res = await api.get('/admin/dashboard');
        return res.data;         // { success, message, data: {...} }
    },
};

export default adminDashboardApi;
