package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentDashboardService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;
    private final AgentRatingCalculator agentRatingCalculator;
    private final ReviewRepository reviewRepository;

    /**
     * Builds the Agent Dashboard "stats" snapshot for a single agent.
     * <p>
     * Notes:
     * - Most metrics are simple counts from repositories.
     * - Revenue is computed as the sum of totalPrice for completed bookings (null-safe).
     * - Rating is read from the Agent entity (defaults to 0.0 if not present).
     */
    @Transactional
    public AgentDashboardStatsResponse getStats(Long agentId) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new com.travelhub.backend.common.ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();

        // Calculate date ranges for Current Month (CM) vs Previous Month (PM)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfCurrentMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfPreviousMonth = startOfCurrentMonth.minusMonths(1);

        LocalDate today = LocalDate.now();
        LocalDate startOfCurrentMonthDate = today.withDayOfMonth(1);
        LocalDate startOfPreviousMonthDate = startOfCurrentMonthDate.minusMonths(1);

        // Count trips that are currently ongoing/active for this agent.
        long activeTrips = bookingRepository.findByAgentId(realAgentId)
                .stream()
                .filter(b -> b.getStatus().equals("active") ||
                        b.getStatus().equals("confirmed") ||
                        b.getStatus().equals("in_progress") ||
                        b.getStatus().equals("In_progress"))
                .count();

        // Completed/pending counts are pulled via status-specific repository methods.
        long completedTrips = bookingRepository
                .findByAgentIdAndStatus(realAgentId, "completed").size();
        long pendingRequests = bookingRepository
                .findByAgentIdAndStatus(realAgentId, "pending").size();

        // Inventory counts for the agent.
        long totalVehicles = vehicleRepository
                .findByAgentId(realAgentId).size();
        long totalDrivers = driverRepository
                .findByAgentId(realAgentId).size();

        // Total packages created/owned by this agent.
        long totalPackages = packageRepository.countByAgent_Id(realAgentId);

        // Revenue = sum of totalPrice across completed bookings (treat null as 0).
        Double totalRevenue = bookingRepository
                .findByAgentIdAndStatus(realAgentId, "completed")
                .stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        Double averageRating = agentRatingCalculator.getAgentRating(realAgentId);

        // --- TREND CALCULATIONS ---

        // 1. Total Packages Trend (CM vs PM)
        List<Package> packages = packageRepository.findByAgent_Id(realAgentId);
        long packagesThisMonth = packages.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(startOfCurrentMonth))
                .count();
        long packagesLastMonth = packages.stream()
                .filter(p -> p.getCreatedAt() != null 
                        && !p.getCreatedAt().isBefore(startOfPreviousMonth) 
                        && p.getCreatedAt().isBefore(startOfCurrentMonth))
                .count();
        Double totalPackagesTrend = calculateTrend(packagesThisMonth, packagesLastMonth);

        // Fetch bookings once to avoid N+1 queries
        List<Booking> bookings = bookingRepository.findByAgentId(realAgentId);

        // 2. Active Trips Trend (Trips starting in CM vs PM)
        long activeThisMonth = bookings.stream()
                .filter(b -> b.getStartDate() != null && !b.getStartDate().isBefore(startOfCurrentMonthDate))
                .count();
        long activeLastMonth = bookings.stream()
                .filter(b -> b.getStartDate() != null 
                        && !b.getStartDate().isBefore(startOfPreviousMonthDate) 
                        && b.getStartDate().isBefore(startOfCurrentMonthDate))
                .count();
        Double activeTripsTrend = calculateTrend(activeThisMonth, activeLastMonth);

        // 3. Completed Trips Trend (Trips completed in CM vs PM)
        long completedThisMonth = bookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) 
                        && b.getEndDate() != null 
                        && !b.getEndDate().isBefore(startOfCurrentMonthDate))
                .count();
        long completedLastMonth = bookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) 
                        && b.getEndDate() != null 
                        && !b.getEndDate().isBefore(startOfPreviousMonthDate) 
                        && b.getEndDate().isBefore(startOfCurrentMonthDate))
                .count();
        Double completedTripsTrend = calculateTrend(completedThisMonth, completedLastMonth);

        // 4. Pending Requests Trend (Requests received in CM vs PM)
        long pendingThisMonth = bookings.stream()
                .filter(b -> b.getCreatedAt() != null && !b.getCreatedAt().isBefore(startOfCurrentMonth))
                .count();
        long pendingLastMonth = bookings.stream()
                .filter(b -> b.getCreatedAt() != null 
                        && !b.getCreatedAt().isBefore(startOfPreviousMonth) 
                        && b.getCreatedAt().isBefore(startOfCurrentMonth))
                .count();
        Double pendingRequestsTrend = calculateTrend(pendingThisMonth, pendingLastMonth);

        // 5. Total Revenue Trend (Completed bookings revenue in CM vs PM)
        double revenueThisMonth = bookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) 
                        && b.getEndDate() != null 
                        && !b.getEndDate().isBefore(startOfCurrentMonthDate))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();
        double revenueLastMonth = bookings.stream()
                .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) 
                        && b.getEndDate() != null 
                        && !b.getEndDate().isBefore(startOfPreviousMonthDate) 
                        && b.getEndDate().isBefore(startOfCurrentMonthDate))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0.0)
                .sum();
        Double totalRevenueTrend = calculateTrend(revenueThisMonth, revenueLastMonth);

        // 6. Average Rating Trend (MoM change in average rating of reviews)
        List<Review> reviews = reviewRepository.findByAgent_Id(realAgentId);
        double sumRatingThisMonth = reviews.stream()
                .filter(r -> r.getReviewDate() != null && !r.getReviewDate().isBefore(startOfCurrentMonth))
                .mapToDouble(Review::getRating)
                .sum();
        long countRatingThisMonth = reviews.stream()
                .filter(r -> r.getReviewDate() != null && !r.getReviewDate().isBefore(startOfCurrentMonth))
                .count();
        double avgRatingThisMonth = countRatingThisMonth > 0 ? sumRatingThisMonth / countRatingThisMonth : 0.0;

        double sumRatingLastMonth = reviews.stream()
                .filter(r -> r.getReviewDate() != null 
                        && !r.getReviewDate().isBefore(startOfPreviousMonth) 
                        && r.getReviewDate().isBefore(startOfCurrentMonth))
                .mapToDouble(Review::getRating)
                .sum();
        long countRatingLastMonth = reviews.stream()
                .filter(r -> r.getReviewDate() != null 
                        && !r.getReviewDate().isBefore(startOfPreviousMonth) 
                        && r.getReviewDate().isBefore(startOfCurrentMonth))
                .count();
        double avgRatingLastMonth = countRatingLastMonth > 0 ? sumRatingLastMonth / countRatingLastMonth : 0.0;
        Double averageRatingTrend = calculateTrend(avgRatingThisMonth, avgRatingLastMonth);

        // Assemble the DTO response for the dashboard.
        return AgentDashboardStatsResponse.builder()
                .totalPackages(totalPackages)
                .activeTrips(activeTrips)
                .completedTrips(completedTrips)
                .pendingRequests(pendingRequests)
                .totalRevenue(totalRevenue)
                .averageRating(averageRating)
                .totalVehicles(totalVehicles)
                .totalDrivers(totalDrivers)
                .totalPackagesTrend(totalPackagesTrend)
                .activeTripsTrend(activeTripsTrend)
                .completedTripsTrend(completedTripsTrend)
                .pendingRequestsTrend(pendingRequestsTrend)
                .totalRevenueTrend(totalRevenueTrend)
                .averageRatingTrend(averageRatingTrend)
                .build();
    }

    private Double calculateTrend(double current, double previous) {
        if (previous == 0.0) {
            if (current == 0.0) {
                return 0.0;
            }
            return 100.0;
        }
        double diff = current - previous;
        double percentage = (diff / previous) * 100.0;
        return Math.round(percentage * 10.0) / 10.0;
    }
}
