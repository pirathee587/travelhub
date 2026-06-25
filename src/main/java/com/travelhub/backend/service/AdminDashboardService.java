package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository    userRepository;
    private final AgentRepository   agentRepository;
    private final HotelRepository   hotelRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository  reviewRepository;
    private final PaymentRepository paymentRepository;

    public AdminDashboardResponse getDashboardStats() {

        // ── Users (Total registered accounts) ────────────
        Long totalTourists =
                userRepository.countByRole(Role.TOURIST);
        Long totalRegisteredAgents =
                userRepository.countByRole(Role.AGENT);
        Long totalHotelManagers =
                userRepository.countByRole(Role.HOTEL_OWNER);
        Long totalUsers =
                totalTourists + totalRegisteredAgents + totalHotelManagers;

        // ── Active/Approved Agents ──────────────────────
        Long totalAgents = agentRepository.countApprovedAgents();

        // ── Pending Agents ──────────────────────────────
        Long pendingAgents = agentRepository.countPendingAgents();

        // ── Hotels ──────────────────────────────────────
        Long totalHotels = hotelRepository.countByApplicationStatus("Approved");
        Long pendingHotels = hotelRepository.countByApplicationStatus("Pending");

        // ── Packages ────────────────────────────────────
        Long totalPackages   = (long) packageRepository.countByApplicationStatus("Approved");
        Long pendingPackages = (long) packageRepository.countByApplicationStatus("Pending");

        // ── Bookings ────────────────────────────────────
        Long totalBookings   = bookingRepository.count();
        Long pendingBookings = bookingRepository.countByStatus("pending");

        // ── Reviews ─────────────────────────────────────
        Long totalReviews = reviewRepository.count();

        // ── Revenue ─────────────────────────────────────
        Double totalRevenue = paymentRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

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
                pendingBookings,
                pendingHotels,
                pendingPackages,
                totalRevenue
        );
    }
}