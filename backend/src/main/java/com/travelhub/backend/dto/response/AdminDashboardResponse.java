package com.travelhub.backend.dto.response;

public record AdminDashboardResponse(
        Long   totalUsers,
        Long   totalTourists,
        Long   totalAgents,
        Long   activeAgents,           // Approved + Active + not Suspended agents only
        Long   totalHotelManagers,
        Long   totalHotels,            // Approved hotels only
        Long   totalPackages,
        Long   totalBookings,
        Long   totalReviews,
        Long   pendingAgents,
        Long   pendingBookings,
        Long   pendingHotels,
        Long   pendingPackages,
        Long   pendingDrivers,
        Long   pendingVehicles,
        java.util.List<String> months,
        java.util.List<Integer> monthlyBookings,
        Double totalRevenue,
        java.util.List<Double> monthlyRevenues,
        java.util.Map<String, Long> packageDistribution,
        java.util.List<RecentActivityDto> recentActivities,
        Double userGrowth,
        Double agentGrowth,
        Double hotelGrowth,
        Double packageGrowth,
        Double bookingGrowth,
        Double revenueGrowth,
        Double yearlyBookingGrowth,
        Double yearlyRevenueGrowth
) {
    public record RecentActivityDto(
            String title,
            String desc,
            String status,
            String timestamp,
            String icon,
            String color
    ) {}
}