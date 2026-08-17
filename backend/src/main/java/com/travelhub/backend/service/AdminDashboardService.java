package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.Hotel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository    userRepository;
    private final HotelRepository   hotelRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository  reviewRepository;
    private final PaymentRepository paymentRepository;
    private final DriverRepository  driverRepository;
    private final VehicleRepository vehicleRepository;

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

        // ── Pending Items ──────────────────────────────
        Long pendingAgents = (long) userRepository
                .findByRoleAndAgentApprovedFalse(Role.AGENT)
                .size();
        Long pendingHotels = (long) hotelRepository
                .findByApplicationStatus("Pending")
                .size();
        Long pendingPackages = (long) packageRepository
                .findByApplicationStatus("Pending")
                .size();
        Long pendingDrivers = (long) driverRepository
                .findByLifecycleStatus("pending")
                .size();
        Long pendingVehicles = (long) vehicleRepository
                .findByLifecycleStatus("pending")
                .size();

        // ── Totals ──────────────────────────────────────
        Long totalHotels = hotelRepository.count();
        Long totalPackages = packageRepository.count();
        Long totalBookings  = bookingRepository.count();
        Long pendingBookings =
                bookingRepository.countByStatus("pending");
        Long totalReviews = reviewRepository.count();

        // ── Revenue ─────────────────────────────────────
        Double totalRevenue = paymentRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

        // ── Last 6 Months Stats ────────────────────────
        List<String> months = new ArrayList<>();
        List<Integer> monthlyBookings = new ArrayList<>();
        List<Double> monthlyRevenues = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        List<Booking> allBookings = bookingRepository.findAll();
        List<Payment> allPayments = paymentRepository.findAll();

        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            months.add(monthDate.format(formatter));
            
            long bCount = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && 
                             b.getCreatedAt().getYear() == monthDate.getYear() && 
                             b.getCreatedAt().getMonthValue() == monthDate.getMonthValue())
                .count();
            monthlyBookings.add((int) bCount);

            double rSum = allPayments.stream()
                .filter(p -> p.getCreatedAt() != null && 
                             "Payment".equals(p.getType()) &&
                             "Completed".equals(p.getStatus()) &&
                             p.getCreatedAt().getYear() == monthDate.getYear() && 
                             p.getCreatedAt().getMonthValue() == monthDate.getMonthValue())
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
            monthlyRevenues.add(rSum);
        }

        // ── Package Distribution ───────────────────────
        List<Package> packages = packageRepository.findAll();
        Map<String, Long> packageDistribution = new HashMap<>();
        for (Package p : packages) {
            if (p.getCategory() != null) {
                String cat = p.getCategory().toUpperCase();
                packageDistribution.put(cat, packageDistribution.getOrDefault(cat, 0L) + 1);
            }
        }

        // ── Recent Activities (Approved Agencies & Hotels) ─────────────
        record ActivityCandidate(
                String title,
                String desc,
                String status,
                java.time.LocalDateTime timestamp,
                String icon,
                String color
        ) {}

        List<ActivityCandidate> candidates = new ArrayList<>();

        // 1. Approved Agencies
        List<User> approvedAgents = userRepository.findByRole(Role.AGENT).stream()
                .filter(u -> Boolean.TRUE.equals(u.getAgentApproved()))
                .toList();

        for (User agent : approvedAgents) {
            java.time.LocalDateTime ts = agent.getUpdatedAt() != null ? agent.getUpdatedAt() : agent.getCreatedAt();
            String desc = agent.getName() != null && !agent.getName().isBlank() 
                    ? agent.getName() 
                    : "Agency Partner";
            if (agent.getEmail() != null && !agent.getEmail().isBlank()) {
                desc += " • " + agent.getEmail();
            }
            candidates.add(new ActivityCandidate(
                    "Agency Approved",
                    desc,
                    "APPROVED",
                    ts,
                    "🏢",
                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
            ));
        }

        // 2. Approved Hotels
        List<Hotel> approvedHotels = hotelRepository.findByApplicationStatus("Approved");
        for (Hotel hotel : approvedHotels) {
            java.time.LocalDateTime ts = null;
            if (hotel.getOwner() != null) {
                ts = hotel.getOwner().getUpdatedAt() != null ? hotel.getOwner().getUpdatedAt() : hotel.getOwner().getCreatedAt();
            }
            String desc = hotel.getHotelName() != null ? hotel.getHotelName() : "Partner Hotel";
            if (hotel.getDistrict() != null && !hotel.getDistrict().isBlank()) {
                desc += " • " + hotel.getDistrict();
            } else if (hotel.getDestination() != null && !hotel.getDestination().isBlank()) {
                desc += " • " + hotel.getDestination();
            }
            candidates.add(new ActivityCandidate(
                    "Hotel Approved",
                    desc,
                    "APPROVED",
                    ts,
                    "🏨",
                    "bg-sky-50 text-sky-600 border border-sky-100"
            ));
        }

        List<AdminDashboardResponse.RecentActivityDto> recentActivities = candidates.stream()
                .sorted((a, b) -> {
                    if (a.timestamp() == null && b.timestamp() == null) return 0;
                    if (a.timestamp() == null) return 1;
                    if (b.timestamp() == null) return -1;
                    return b.timestamp().compareTo(a.timestamp());
                })
                .limit(5)
                .map(c -> new AdminDashboardResponse.RecentActivityDto(
                        c.title(),
                        c.desc(),
                        c.status(),
                        c.timestamp() != null ? c.timestamp().toString() : "",
                        c.icon(),
                        c.color()
                ))
                .collect(Collectors.toList());

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
                pendingDrivers,
                pendingVehicles,
                months,
                monthlyBookings,
                totalRevenue,
                monthlyRevenues,
                packageDistribution,
                recentActivities
        );
    }
}