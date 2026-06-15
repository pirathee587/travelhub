package com.travelhub.backend.dto.response;

/**
 * AdminDashboardResponse is a compact data record used to populate the administrative overview dashboard.
 * It provides a snapshot of the platform's health and operational activity through various system-wide counters.
 */
public record AdminDashboardResponse(
        // Total count of all registered user accounts
        Long   totalUsers,
        
        // Count of users with the TOURIST role
        Long   totalTourists,
        
        // Count of active/registered travel agents
        Long   totalAgents,
        
        // Count of registered hotel owners/managers
        Long   totalHotelManagers,
        
        // Total number of hotel properties listed on the platform
        Long   totalHotels,
        
        // Total number of travel packages available for booking
        Long   totalPackages,
        
        // Lifetime count of bookings processed by the system
        Long   totalBookings,
        
        // Cumulative count of user reviews across all services
        Long   totalReviews,
        
        // Critical: Number of agent applications currently awaiting administrative approval
        Long   pendingAgents,
        
        // Number of hotel applications currently awaiting administrative approval
        Long   pendingHotels,
        
        // Number of reservations that are currently in 'Pending' status
        Long   pendingBookings
) {}