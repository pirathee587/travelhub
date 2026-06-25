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
        Double totalRevenue,
        
        // New fields for charts and dashboard details
        java.util.List<String> months,
        java.util.List<Long> monthlyBookings,
        java.util.List<Double> monthlyRevenues,
        java.util.List<RecentActivityResponse> recentActivities,
        java.util.Map<String, Long> packageDistribution
) {}