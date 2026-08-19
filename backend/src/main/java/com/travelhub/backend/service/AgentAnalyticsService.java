package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AnalyticsResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentAnalyticsService {

    private final BookingRepository bookingRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final AgentRepository agentRepository;

    /**
     * Builds the analytics payload for an agent for a given period.
     * <p>
     * Output includes:
     * - Stat cards: revenue, trips, rating, cancellation rate
     * - Revenue chart: label/value pairs depending on period (monthly/quarterly/yearly)
     * - Trip status breakdown
     * - Top destinations (by number of bookings)
     * - Driver performance (basic profile slice)
     * - Vehicle utilization (trip count per vehicle within the filtered set)
     */
    @Transactional
    public AnalyticsResponse getAnalytics(Long agentId, String period) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new com.travelhub.backend.common.ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();
        // Load all bookings for the agent, then apply the time-window filter.
        List<Booking> allBookings = bookingRepository.findByAgentId(realAgentId);
        List<Booking> filtered = filterByPeriod(allBookings, period);

        // Stat cards: net revenue (95%) from completed trips.
        double totalRevenue = filtered.stream()
                .filter(b -> b.getStatus() != null && "completed".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() * 0.95 : 0)
                .sum();

        // Stat cards: total completed trips within the filtered period.
        long totalTrips = filtered.stream()
                .filter(b -> b.getStatus() != null && b.getStatus().equalsIgnoreCase("completed"))
                .count();

        // Stat cards: cancellation count + cancellation rate (% of filtered bookings).
        long cancelled = filtered.stream()
                .filter(b -> b.getStatus() != null && (b.getStatus().equalsIgnoreCase("cancelled") || b.getStatus().equalsIgnoreCase("rejected") || b.getStatus().equalsIgnoreCase("refund_requested")))
                .count();

        double cancellationRate = filtered.isEmpty() ? 0 :
                Math.round(((double) cancelled / filtered.size()) * 100.0) / 1.0;

        // Stat cards: agent rating (default 0.0 if missing/null).
        double averageRating = agent.getRating() != null ? agent.getRating() : 0.0;

        // Revenue chart data (label/value pairs; labels depend on the selected period).
        List<Map<String, Object>> revenueData = buildRevenueData(filtered, period);

        // Trip status breakdown (for pie/donut charts).
        Map<String, Long> tripStatusData = new LinkedHashMap<>();
        tripStatusData.put("completed", filtered.stream().filter(b -> b.getStatus() != null && b.getStatus().equalsIgnoreCase("completed")).count());
        tripStatusData.put("active", filtered.stream().filter(b -> b.getStatus() != null && (b.getStatus().equalsIgnoreCase("active") || b.getStatus().equalsIgnoreCase("confirmed") || b.getStatus().equalsIgnoreCase("in_progress") || b.getStatus().equalsIgnoreCase("paid"))).count());
        tripStatusData.put("pending", filtered.stream().filter(b -> b.getStatus() != null && b.getStatus().equalsIgnoreCase("pending")).count());
        tripStatusData.put("cancelled", cancelled);

        // Top destinations: group valid confirmed/active/completed bookings by package district/destination and take the top 5 by count.
        List<Map<String, Object>> topDestinations = filtered.stream()
                .filter(b -> {
                    try {
                        if (b.getPkg() == null || (b.getPkg().getDistrict() == null && b.getPkg().getDestination() == null)) {
                            return false;
                        }
                        String st = b.getStatus();
                        return st != null && (st.equalsIgnoreCase("confirmed") || st.equalsIgnoreCase("active") || st.equalsIgnoreCase("in_progress") || st.equalsIgnoreCase("completed") || st.equalsIgnoreCase("paid"));
                    } catch (Exception e) { return false; }
                })
                .collect(Collectors.groupingBy(b -> {
                    if (b.getPkg().getDistrict() != null && !b.getPkg().getDistrict().isBlank()) {
                        return b.getPkg().getDistrict();
                    }
                    return b.getPkg().getDestination() != null ? b.getPkg().getDestination() : "Other";
                }, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("district", e.getKey());
                    m.put("destination", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Driver performance: take up to 5 approved drivers for this agent.
        List<Map<String, Object>> driverPerformance = driverRepository
                .findByAgentId(realAgentId).stream()
                .filter(d -> d.getLifecycleStatus() == null ||
                        "active".equalsIgnoreCase(d.getLifecycleStatus()) ||
                        "approved".equalsIgnoreCase(d.getLifecycleStatus()))
                .limit(5)
                .map(d -> {
                    long trips = filtered.stream()
                            .filter(b -> b.getDriver() != null &&
                                    b.getDriver().getId().equals(d.getId()) &&
                                    "completed".equalsIgnoreCase(b.getStatus()))
                            .count();
                    boolean isOnTrip = filtered.stream()
                            .anyMatch(b -> b.getDriver() != null &&
                                    b.getDriver().getId().equals(d.getId()) &&
                                    "in_progress".equalsIgnoreCase(b.getStatus()));
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", d.getFirstName() + " " + (d.getLastName() != null ? d.getLastName() : ""));
                    m.put("rating", d.getRating() != null ? d.getRating() : 0.0);
                    m.put("status", isOnTrip ? "on-trip" : "available");
                    m.put("trips", trips);
                    return m;
                })
                .collect(Collectors.toList());

        // Vehicle utilization: for each of up to 5 approved vehicles, count how many COMPLETED bookings used it.
        List<Map<String, Object>> vehicleUtilization = vehicleRepository
                .findByAgentId(realAgentId).stream()
                .filter(v -> v.getLifecycleStatus() == null ||
                        "active".equalsIgnoreCase(v.getLifecycleStatus()) ||
                        "approved".equalsIgnoreCase(v.getLifecycleStatus()))
                .limit(5)
                .map(v -> {
                    long trips = filtered.stream()
                            .filter(b -> b.getVehicle() != null &&
                                    b.getVehicle().getId().equals(v.getId()) &&
                                    "completed".equalsIgnoreCase(b.getStatus()))
                            .count();
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", v.getBrand() + " " + v.getModel());
                    m.put("registration", v.getRegistration());
                    m.put("trips", trips);
                    return m;
                })
                .collect(Collectors.toList());

        // Assemble the DTO returned to the controller/UI.
        return AnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalTrips(totalTrips)
                .averageRating(averageRating)
                .cancellationRate(cancellationRate)
                .revenueData(revenueData)
                .tripStatusData(tripStatusData)
                .topDestinations(topDestinations)
                .driverPerformance(driverPerformance)
                .vehicleUtilization(vehicleUtilization)
                .build();
    }

    /**
     * Filters bookings based on the requested period.
     * Period values:
     * - "monthly" (default): last 1 month
     * - "quarterly": last 3 months
     * - "yearly": last 1 year
     */
    private List<Booking> filterByPeriod(List<Booking> bookings, String period) {
        LocalDate now = LocalDate.now();
        LocalDate from;

        switch (period != null ? period : "monthly") {
            case "yearly":  from = now.minusYears(1); break;
            case "quarterly": from = now.minusMonths(3); break;
            default: from = now.minusMonths(1); break;
        }

        LocalDate finalFrom = from;
        return bookings.stream()
                .filter(b -> {
                    LocalDateTime dt = b.getCreatedAt();
                    if (dt == null && b.getStartDate() != null) {
                        dt = b.getStartDate().atStartOfDay();
                    }
                    if (dt == null) {
                        return true; // Include if date is unspecified
                    }
                    return !dt.toLocalDate().isBefore(finalFrom);
                })
                .collect(Collectors.toList());
    }

    /**
     * Builds the revenue chart series (label/value entries) for the given period.
     */
    private List<Map<String, Object>> buildRevenueData(List<Booking> bookings, String period) {
        List<Map<String, Object>> result = new ArrayList<>();
        boolean isYearly = "yearly".equalsIgnoreCase(period);
        boolean isQuarterly = "quarterly".equalsIgnoreCase(period);

        if (isYearly) {
            String[] months = {"Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"};
            for (int i = 0; i < 12; i++) {
                final int month = i + 1;
                double revenue = bookings.stream()
                        .filter(b -> b.getStatus() != null && "completed".equalsIgnoreCase(b.getStatus()) &&
                                ((b.getCreatedAt() != null && b.getCreatedAt().getMonthValue() == month) ||
                                 (b.getCreatedAt() == null && b.getStartDate() != null && b.getStartDate().getMonthValue() == month)))
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() * 0.95 : 0)
                        .sum();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", months[i]);
                m.put("value", revenue);
                result.add(m);
            }
        } else if (isQuarterly) {
            LocalDate now = LocalDate.now();
            for (int i = 11; i >= 0; i--) {
                LocalDate weekStart = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
                LocalDate weekEnd = weekStart.plusDays(6);
                double revenue = bookings.stream()
                        .filter(b -> "completed".equalsIgnoreCase(b.getStatus()) && b.getCreatedAt() != null)
                        .filter(b -> {
                            LocalDate d = b.getCreatedAt().toLocalDate();
                            return !d.isBefore(weekStart) && !d.isAfter(weekEnd);
                        })
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() * 0.95 : 0)
                        .sum();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", "Week " + (12 - i));
                m.put("value", revenue);
                result.add(m);
            }
        } else {
            String[] days = {"Mon","Tue","Wed","Thu","Fri","Sat","Sun"};
            for (int i = 0; i < days.length; i++) {
                final int dayOfWeek = i + 1; // 1 = Mon, 7 = Sun
                double revenue = bookings.stream()
                        .filter(b -> b.getStatus() != null && "completed".equalsIgnoreCase(b.getStatus()) &&
                                ((b.getCreatedAt() != null && b.getCreatedAt().getDayOfWeek().getValue() == dayOfWeek) ||
                                 (b.getCreatedAt() == null && b.getStartDate() != null && b.getStartDate().getDayOfWeek().getValue() == dayOfWeek)))
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() * 0.95 : 0)
                        .sum();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", days[i]);
                m.put("value", revenue);
                result.add(m);
            }
        }
        return result;
    }
}
