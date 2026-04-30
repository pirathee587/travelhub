package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository    userRepository;
    private final HotelRepository   hotelRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository  reviewRepository;

    public AdminDashboardResponse getDashboardStats() {

        // ── Users ───────────────────────────────────────
        Long totalTourists =
                userRepository.countByRole(Role.TOURIST);
        Long totalAgents =
                userRepository.countByRole(Role.AGENT);
        Long totalHotelManagers =
                userRepository.countByRole(Role.HOTEL_OWNER);
        Long totalUsers =
                totalTourists + totalAgents + totalHotelManagers;

        // ── Pending Agents ──────────────────────────────
        Long pendingAgents = (long) userRepository
                .findByRoleAndAgentApprovedFalse(Role.AGENT)
                .size();

        // ── Hotels ──────────────────────────────────────
        Long totalHotels = hotelRepository.count();

        // ── Packages ────────────────────────────────────
        Long totalPackages = packageRepository.count();

        // ── Bookings ────────────────────────────────────
        Long totalBookings  = bookingRepository.count();
        Long pendingBookings =
                bookingRepository.countByStatus("pending");

        // ── Reviews ─────────────────────────────────────
        Long totalReviews = reviewRepository.count();

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
                pendingBookings
        );
    }
}