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
        Double totalRevenue
) {}