package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.dto.response.RecentActivityResponse;
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
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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

        // ── Charts & Activities ───────────────────────────
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDateTime startDateTime = now.minusMonths(5).withDayOfMonth(1).atStartOfDay();

        java.util.List<String> months = new java.util.ArrayList<>();
        java.util.List<Long> monthlyBookings = new java.util.ArrayList<>();
        java.util.List<Double> monthlyRevenues = new java.util.ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            java.time.LocalDate d = now.minusMonths(i);
            String monthName = d.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
            months.add(monthName);
            monthlyBookings.add(0L);
            monthlyRevenues.add(0.0);
        }

        // Fetch bookings & payments in the last 6 months
        java.util.List<com.travelhub.backend.entity.Booking> recentBookingsForTrends = bookingRepository.findByCreatedAtAfter(startDateTime);
        java.util.List<com.travelhub.backend.entity.Payment> recentPaymentsForTrends = paymentRepository.findByCreatedAtAfter(startDateTime);

        // Populate booking trends
        for (com.travelhub.backend.entity.Booking b : recentBookingsForTrends) {
            if (b.getCreatedAt() != null) {
                String mName = b.getCreatedAt().getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
                int idx = months.indexOf(mName);
                if (idx != -1) {
                    monthlyBookings.set(idx, monthlyBookings.get(idx) + 1);
                }
            }
        }

        // Populate revenue trends
        for (com.travelhub.backend.entity.Payment p : recentPaymentsForTrends) {
            if (p.getCreatedAt() != null && "Payment".equalsIgnoreCase(p.getType()) && "Completed".equalsIgnoreCase(p.getStatus())) {
                String mName = p.getCreatedAt().getMonth().getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
                int idx = months.indexOf(mName);
                if (idx != -1) {
                    monthlyRevenues.set(idx, monthlyRevenues.get(idx) + p.getAmount());
                }
            }
        }

        // Fetch recent activities
        java.util.List<RecentActivityResponse> recentActivities = new java.util.ArrayList<>();

        // 1. Recent Bookings (top 5)
        java.util.List<com.travelhub.backend.entity.Booking> bookings = bookingRepository.findTop5ByOrderByCreatedAtDesc();
        for (com.travelhub.backend.entity.Booking b : bookings) {
            if (b.getCreatedAt() != null) {
                String desc = b.getPkg() != null ? b.getPkg().getPackageName() : ("Booking #" + b.getId());
                recentActivities.add(new RecentActivityResponse(
                        "New booking created",
                        desc,
                        b.getStatus(),
                        b.getCreatedAt(),
                        "📅",
                        "pending".equalsIgnoreCase(b.getStatus()) ? "bg-orange-100 text-orange-700" :
                        "completed".equalsIgnoreCase(b.getStatus()) ? "bg-[#ccfbf1] text-[#0f766e]" :
                        "bg-blue-100 text-blue-700"
                ));
            }
        }

        // 2. Recent Packages (top 5)
        java.util.List<com.travelhub.backend.entity.Package> packages = packageRepository.findTop5ByOrderByCreatedAtDesc();
        for (com.travelhub.backend.entity.Package p : packages) {
            if (p.getCreatedAt() != null) {
                recentActivities.add(new RecentActivityResponse(
                        "Package updated",
                        p.getPackageName(),
                        p.getApplicationStatus(),
                        p.getCreatedAt(),
                        "📦",
                        "Pending".equalsIgnoreCase(p.getApplicationStatus()) ? "bg-orange-100 text-orange-700" :
                        "Approved".equalsIgnoreCase(p.getApplicationStatus()) ? "bg-[#ccfbf1] text-[#0f766e]" :
                        "bg-red-100 text-red-700"
                ));
            }
        }

        // 3. Recent Hotels (top 5)
        java.util.List<com.travelhub.backend.entity.Hotel> hotels = hotelRepository.findTop5ByOrderByIdDesc();
        for (com.travelhub.backend.entity.Hotel h : hotels) {
            java.time.LocalDateTime ts = java.time.LocalDateTime.now();
            if (h.getOwner() != null && h.getOwner().getCreatedAt() != null) {
                ts = h.getOwner().getCreatedAt();
            }
            recentActivities.add(new RecentActivityResponse(
                    "Hotel registration",
                    h.getHotelName(),
                    h.getApplicationStatus(),
                    ts,
                    "🏢",
                    "Pending".equalsIgnoreCase(h.getApplicationStatus()) ? "bg-orange-100 text-orange-700" :
                    "Approved".equalsIgnoreCase(h.getApplicationStatus()) ? "bg-[#ccfbf1] text-[#0f766e]" :
                    "bg-red-100 text-red-700"
            ));
        }

        // 4. Recent Agents (top 5)
        java.util.List<com.travelhub.backend.entity.Agent> agents = agentRepository.findTop5ByOrderBySubmittedDateDesc();
        for (com.travelhub.backend.entity.Agent a : agents) {
            java.time.LocalDateTime ts = a.getSubmittedDate() != null ? a.getSubmittedDate() : java.time.LocalDateTime.now();
            String status = a.getOwner() != null && Boolean.TRUE.equals(a.getOwner().getAgentApproved()) ? "Approved" : "Pending";
            recentActivities.add(new RecentActivityResponse(
                    "New agent registration",
                    a.getAgencyName(),
                    status,
                    ts,
                    "👤",
                    "Pending".equalsIgnoreCase(status) ? "bg-orange-100 text-orange-700" : "bg-[#ccfbf1] text-[#0f766e]"
            ));
        }

        // Sort all merged activities by timestamp desc, and select top 5
        recentActivities.sort((x, y) -> y.timestamp().compareTo(x.timestamp()));
        if (recentActivities.size() > 5) {
            recentActivities = new java.util.ArrayList<>(recentActivities.subList(0, 5));
        }

        // Package Distribution
        java.util.Map<String, Long> packageDistribution = new java.util.HashMap<>();
        java.util.List<Object[]> categoryCounts = packageRepository.countPackagesByCategory();
        for (Object[] row : categoryCounts) {
            String cat = row[0] != null ? row[0].toString() : "Other";
            Long count = ((Number) row[1]).longValue();
            packageDistribution.put(cat, count);
        }

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
                totalRevenue,
                months,
                monthlyBookings,
                monthlyRevenues,
                recentActivities,
                packageDistribution
        );
    }
}