package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * AdminDashboardService provides a global overview of the TravelHub platform for administrators.
 * It aggregates statistics across all major entities, including users, hotels, packages, and bookings.
 */
@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Constructor injection for all core repositories required for global statistics.
     */
    public AdminDashboardService(UserRepository userRepository, HotelRepository hotelRepository, PackageRepository packageRepository, BookingRepository bookingRepository, ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.hotelRepository = hotelRepository;
        this.packageRepository = packageRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    /**
     * Aggregates and returns a comprehensive snapshot of system-wide statistics.
     * This includes role-based user counts, inventory totals, and the current volume of pending actions.
     */
    public AdminDashboardResponse getDashboardStats() {

        // ── User Demographics ───────────────────────────────
        // Count tourists who are the primary consumers
        Long totalTourists = userRepository.countByRole(Role.TOURIST);
        // Count travel agents who manage packages and vehicles
        Long totalAgents = userRepository.countByRole(Role.AGENT);
        // Count hotel owners who list properties
        Long totalHotelManagers = userRepository.countByRole(Role.HOTEL_OWNER);
        // Total active system users across all roles
        Long totalUsers = totalTourists + totalAgents + totalHotelManagers;

        // specifically counts agents who have registered but not yet been approved by admin
        Long pendingAgents = (long) userRepository
                .findByRoleAndAgentApprovedFalse(Role.AGENT)
                .size();

        // specifically counts hotel owners who have registered but not yet been approved by admin
        Long pendingHotels = (long) userRepository
                .findByRoleAndAgentApprovedFalse(Role.HOTEL_OWNER)
                .size();

        // ── Global Inventory ───────────────────────────────
        // Total number of hotels registered on the platform
        Long totalHotels = hotelRepository.count();
        // Total number of travel packages offered
        Long totalPackages = packageRepository.count();

        // ── Operational Statistics ─────────────────────────
        // Total volume of bookings ever created
        Long totalBookings = bookingRepository.count();
        // Count of bookings currently awaiting agent action
        Long pendingBookings = bookingRepository.countByStatus("pending");

        // ── Engagement Metrics ─────────────────────────────
        // Total number of reviews left by users across the platform
        Long totalReviews = reviewRepository.count();

        // Map aggregated metrics to the global dashboard response DTO
        return new AdminDashboardResponse(
                totalUsers,
                totalTourists,
                totalAgents,
                totalHotelManagers,
                totalHotels,
                totalPackages,
                totalBookings,
                totalReviews,
                pendingAgents,
                pendingHotels,
                pendingBookings
        );
    }
}