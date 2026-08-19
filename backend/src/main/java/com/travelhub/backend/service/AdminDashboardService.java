package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminDashboardResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.repository.WalletTransactionRepository;
import com.travelhub.backend.entity.WalletTransaction;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.entity.Vehicle;
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
    private final AgentRepository   agentRepository;
    private final HotelRepository   hotelRepository;
    private final PackageRepository packageRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository  reviewRepository;
    private final PaymentRepository paymentRepository;
    private final DriverRepository  driverRepository;
    private final VehicleRepository vehicleRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public AdminDashboardResponse getDashboardStats() {

        // ── Users (Excluding ADMIN) ─────────────────────
        Long totalTourists = userRepository.countByRole(Role.TOURIST);
        if (totalTourists == null) totalTourists = 0L;

        List<Agent> allAgents = agentRepository.findAll();
        Long totalAgents = (long) allAgents.size();

        // activeAgents = Approved + Active + not Suspended (mirrors resolveAgentStatus logic)
        Long activeAgents = allAgents.stream()
                .filter(a -> "Approved".equalsIgnoreCase(resolveAgentStatus(a.getOwner(), a)))
                .count();

        Long totalHotelManagers = userRepository.countByRole(Role.HOTEL_OWNER);
        if (totalHotelManagers == null) totalHotelManagers = 0L;

        Long totalUsers = userRepository.countByRoleNot(Role.ADMIN);
        if (totalUsers == null) totalUsers = totalTourists + totalAgents + totalHotelManagers;

        // ── Pending Items ──────────────────────────────
        Long pendingAgents = allAgents.stream()
                .filter(a -> "Pending".equalsIgnoreCase(resolveAgentStatus(a.getOwner(), a)))
                .count();

        List<Hotel> allHotels = hotelRepository.findAll();
        Long pendingHotels = allHotels.stream()
                .filter(h -> h.getApplicationStatus() != null && "Pending".equalsIgnoreCase(h.getApplicationStatus()))
                .count();

        List<Package> allPackages = packageRepository.findAll();
        Long pendingPackages = allPackages.stream()
                .filter(p -> p.getDeletedAt() == null && p.getApplicationStatus() != null && "Pending".equalsIgnoreCase(p.getApplicationStatus()))
                .count();

        List<Driver> allDrivers = driverRepository.findAll();
        Long pendingDrivers = allDrivers.stream()
                .filter(d -> d.getLifecycleStatus() != null && "pending".equalsIgnoreCase(d.getLifecycleStatus()))
                .count();

        List<Vehicle> allVehicles = vehicleRepository.findAll();
        Long pendingVehicles = allVehicles.stream()
                .filter(v -> v.getLifecycleStatus() != null && "pending".equalsIgnoreCase(v.getLifecycleStatus()))
                .count();

        // ── Totals ──────────────────────────────────────
        // totalHotels = only Approved AND active partner hotels (not Pending/Rejected/Deactivated)
        Long totalHotels = allHotels.stream()
                .filter(h -> "Approved".equalsIgnoreCase(h.getApplicationStatus())
                        && !Boolean.FALSE.equals(h.getIsActive()))
                .count();
        Long totalPackages = allPackages.stream().filter(p -> p.getDeletedAt() == null).count();

        Long totalBookings  = bookingRepository.count();
        if (totalBookings == null) totalBookings = 0L;

        Long pendingBookings = (long) bookingRepository.findAll().stream()
                .filter(b -> "pending".equalsIgnoreCase(b.getStatus()))
                .count();

        Long totalReviews = reviewRepository.count();
        if (totalReviews == null) totalReviews = 0L;

        // ── Revenue (Platform Net Revenue = Commission + Cancellation Fees) ──────
        List<WalletTransaction> allTxns = walletTransactionRepository.findAll();

        double totalPlatformCommission = allTxns.stream()
                .filter(t -> "COMMISSION_DEDUCTION".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalCancellationCompensation = allTxns.stream()
                .filter(t -> "CANCELLATION_COMPENSATION".equalsIgnoreCase(t.getType()))
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

        double totalPlatformCancellationFees = Math.round((totalCancellationCompensation / 4.0) * 100.0) / 100.0;
        Double totalRevenue = Math.round((totalPlatformCommission + totalPlatformCancellationFees) * 100.0) / 100.0;

        // ── Last 6 Months Stats ────────────────────────
        List<String> months = new ArrayList<>();
        List<Integer> monthlyBookings = new ArrayList<>();
        List<Double> monthlyRevenues = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        List<Booking> allBookings = bookingRepository.findAll();

        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            months.add(monthDate.format(formatter));
            
            long bCount = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && 
                             b.getCreatedAt().getYear() == monthDate.getYear() && 
                             b.getCreatedAt().getMonthValue() == monthDate.getMonthValue())
                .count();
            monthlyBookings.add((int) bCount);

            double mCommission = allTxns.stream()
                .filter(t -> t.getCreatedAt() != null && 
                             "COMMISSION_DEDUCTION".equalsIgnoreCase(t.getType()) &&
                             t.getCreatedAt().getYear() == monthDate.getYear() && 
                             t.getCreatedAt().getMonthValue() == monthDate.getMonthValue())
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

            double mCancel = allTxns.stream()
                .filter(t -> t.getCreatedAt() != null && 
                             "CANCELLATION_COMPENSATION".equalsIgnoreCase(t.getType()) &&
                             t.getCreatedAt().getYear() == monthDate.getYear() && 
                             t.getCreatedAt().getMonthValue() == monthDate.getMonthValue())
                .mapToDouble(t -> t.getAmount() != null ? t.getAmount() : 0.0)
                .sum();

            double mPlatformNetRev = Math.round((mCommission + (mCancel / 4.0)) * 100.0) / 100.0;
            monthlyRevenues.add(mPlatformNetRev);
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
                    "Agent Approved",
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

        // ── Month-over-Month Growth Calculations ───────────────────────
        int curYear = now.getYear();
        int curMonth = now.getMonthValue();
        LocalDate lastMonthDate = now.minusMonths(1);
        int prevYear = lastMonthDate.getYear();
        int prevMonth = lastMonthDate.getMonthValue();

        List<User> allUsers = userRepository.findAll();
        long curUsersCount = allUsers.stream()
                .filter(u -> u.getRole() != Role.ADMIN && u.getCreatedAt() != null && u.getCreatedAt().getYear() == curYear && u.getCreatedAt().getMonthValue() == curMonth)
                .count();
        long prevUsersCount = allUsers.stream()
                .filter(u -> u.getRole() != Role.ADMIN && u.getCreatedAt() != null && u.getCreatedAt().getYear() == prevYear && u.getCreatedAt().getMonthValue() == prevMonth)
                .count();
        Double userGrowth = calculateGrowth(curUsersCount, prevUsersCount);

        long curAgentsCount = allAgents.stream()
                .filter(a -> {
                    java.time.LocalDateTime ts = a.getSubmittedDate();
                    if (ts == null && a.getOwner() != null) ts = a.getOwner().getCreatedAt();
                    return ts != null && ts.getYear() == curYear && ts.getMonthValue() == curMonth;
                })
                .count();
        long prevAgentsCount = allAgents.stream()
                .filter(a -> {
                    java.time.LocalDateTime ts = a.getSubmittedDate();
                    if (ts == null && a.getOwner() != null) ts = a.getOwner().getCreatedAt();
                    return ts != null && ts.getYear() == prevYear && ts.getMonthValue() == prevMonth;
                })
                .count();
        Double agentGrowth = calculateGrowth(curAgentsCount, prevAgentsCount);

        long curHotelsCount = allHotels.stream()
                .filter(h -> {
                    java.time.LocalDateTime ts = h.getOwner() != null ? h.getOwner().getCreatedAt() : null;
                    return ts != null && ts.getYear() == curYear && ts.getMonthValue() == curMonth;
                })
                .count();
        long prevHotelsCount = allHotels.stream()
                .filter(h -> {
                    java.time.LocalDateTime ts = h.getOwner() != null ? h.getOwner().getCreatedAt() : null;
                    return ts != null && ts.getYear() == prevYear && ts.getMonthValue() == prevMonth;
                })
                .count();
        Double hotelGrowth = calculateGrowth(curHotelsCount, prevHotelsCount);

        long curPackagesCount = allPackages.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().getYear() == curYear && p.getCreatedAt().getMonthValue() == curMonth)
                .count();
        long prevPackagesCount = allPackages.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().getYear() == prevYear && p.getCreatedAt().getMonthValue() == prevMonth)
                .count();
        Double packageGrowth = calculateGrowth(curPackagesCount, prevPackagesCount);

        int curBookingsVal = monthlyBookings.size() >= 1 ? monthlyBookings.get(monthlyBookings.size() - 1) : 0;
        int prevBookingsVal = monthlyBookings.size() >= 2 ? monthlyBookings.get(monthlyBookings.size() - 2) : 0;
        Double bookingGrowth = calculateGrowth((long) curBookingsVal, (long) prevBookingsVal);

        double curRevenueVal = monthlyRevenues.size() >= 1 ? monthlyRevenues.get(monthlyRevenues.size() - 1) : 0.0;
        double prevRevenueVal = monthlyRevenues.size() >= 2 ? monthlyRevenues.get(monthlyRevenues.size() - 2) : 0.0;
        Double revenueGrowth = calculateGrowth(curRevenueVal, prevRevenueVal);

        // ── Year-over-Year (YoY) Growth Calculations ───────────
        long thisYearBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().getYear() == curYear)
                .count();
        long lastYearBookings = allBookings.stream()
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().getYear() == (curYear - 1))
                .count();
        Double yearlyBookingGrowth = calculateGrowth(thisYearBookings, lastYearBookings);

        double thisYearRevenue = allTxns.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().getYear() == curYear)
                .mapToDouble(t -> {
                    if ("COMMISSION_DEDUCTION".equalsIgnoreCase(t.getType())) {
                        return t.getAmount() != null ? t.getAmount() : 0.0;
                    } else if ("CANCELLATION_COMPENSATION".equalsIgnoreCase(t.getType())) {
                        return (t.getAmount() != null ? t.getAmount() : 0.0) / 4.0;
                    }
                    return 0.0;
                })
                .sum();

        double lastYearRevenue = allTxns.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().getYear() == (curYear - 1))
                .mapToDouble(t -> {
                    if ("COMMISSION_DEDUCTION".equalsIgnoreCase(t.getType())) {
                        return t.getAmount() != null ? t.getAmount() : 0.0;
                    } else if ("CANCELLATION_COMPENSATION".equalsIgnoreCase(t.getType())) {
                        return (t.getAmount() != null ? t.getAmount() : 0.0) / 4.0;
                    }
                    return 0.0;
                })
                .sum();
        Double yearlyRevenueGrowth = calculateGrowth(thisYearRevenue, lastYearRevenue);

        return new AdminDashboardResponse(
                totalUsers,
                totalTourists,
                totalAgents,
                activeAgents,
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
                recentActivities,
                userGrowth,
                agentGrowth,
                hotelGrowth,
                packageGrowth,
                bookingGrowth,
                revenueGrowth,
                yearlyBookingGrowth,
                yearlyRevenueGrowth
        );
    }

    private double calculateGrowth(long currentCount, long previousCount) {
        if (previousCount == 0 && currentCount == 0) return 0.0;
        if (previousCount == 0) return 100.0;
        double change = ((double) (currentCount - previousCount) / (double) previousCount) * 100.0;
        return Math.round(change * 10.0) / 10.0;
    }

    private double calculateGrowth(double currentAmount, double previousAmount) {
        if (previousAmount == 0.0 && currentAmount == 0.0) return 0.0;
        if (previousAmount == 0.0) return 100.0;
        double change = ((currentAmount - previousAmount) / previousAmount) * 100.0;
        return Math.round(change * 10.0) / 10.0;
    }

    private String resolveAgentStatus(com.travelhub.backend.entity.User owner, Agent agent) {
        if (owner == null) return "Pending";
        if (Boolean.FALSE.equals(owner.getIsActive()) || (agent != null && Boolean.FALSE.equals(agent.getIsActive())) || "SUSPENDED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Suspended";
        }
        if ("REJECTED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Rejected";
        }
        if (Boolean.TRUE.equals(owner.getAgentApproved()) || "APPROVED".equalsIgnoreCase(owner.getNicVerificationStatus())) {
            return "Approved";
        }
        return "Pending";
    }
}