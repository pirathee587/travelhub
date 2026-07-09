package com.travelhub.backend.dto.response;

public record AdminDashboardResponse(
        Long   totalUsers,
        Long   totalTourists,
        Long   totalAgents,
        Long   totalHotelManagers,
        Long   totalHotels,
        Long   totalPackages,
        Long   totalBookings,
        Long   totalReviews,
        Long   pendingAgents,
        Long   pendingBookings,
        Long   pendingHotels,
        Long   pendingPackages,
        java.util.List<String> months,
        java.util.List<Integer> monthlyBookings,
        Double totalRevenue,
        java.util.List<Double> monthlyRevenues,
        java.util.Map<String, Long> packageDistribution,
        java.util.List<RecentActivityDto> recentActivities
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