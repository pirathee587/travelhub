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

        // Stat cards: total revenue from completed trips (null-safe totalPrice).
        double totalRevenue = filtered.stream()
                .filter(b -> b.getStatus().equals("completed"))
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        // Stat cards: total completed trips within the filtered period.
        long totalTrips = filtered.stream()
                .filter(b -> b.getStatus().equals("completed"))
                .count();

        // Stat cards: cancellation count + cancellation rate (% of filtered bookings).
        long cancelled = filtered.stream()
                .filter(b -> b.getStatus().equals("cancelled"))
                .count();

        double cancellationRate = filtered.isEmpty() ? 0 :
                Math.round(((double) cancelled / filtered.size()) * 100.0) / 1.0;

        // Stat cards: agent rating (default 0.0 if missing/null).
        double averageRating = agent.getRating() != null ? agent.getRating() : 0.0;

        // Revenue chart data (label/value pairs; labels depend on the selected period).
        List<Map<String, Object>> revenueData = buildRevenueData(filtered, period);

        // Trip status breakdown (for pie/donut charts).
        Map<String, Long> tripStatusData = new LinkedHashMap<>();
        tripStatusData.put("completed", filtered.stream().filter(b -> b.getStatus().equals("completed")).count());
        tripStatusData.put("active", filtered.stream().filter(b -> b.getStatus().equals("active")).count());
        tripStatusData.put("pending", filtered.stream().filter(b -> b.getStatus().equals("pending")).count());
        tripStatusData.put("cancelled", cancelled);

        // Top destinations: group bookings by package destination and take the top 5 by count.
        List<Map<String, Object>> topDestinations = filtered.stream()
                .filter(b -> {
                    try { return b.getPkg() != null && b.getPkg().getDestination() != null; }
                    catch (Exception e) { return false; }
                })
                .collect(Collectors.groupingBy(b -> b.getPkg().getDestination(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("destination", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Driver performance: take up to 5 drivers for this agent (basic summary fields).
        List<Map<String, Object>> driverPerformance = driverRepository
                .findByAgentId(realAgentId).stream()
                .limit(5)
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", d.getFirstName() + " " + (d.getLastName() != null ? d.getLastName() : ""));
                    m.put("rating", d.getRating() != null ? d.getRating() : 0.0);
                    m.put("status", d.getStatus());
                    return m;
                })
                .collect(Collectors.toList());

        // Vehicle utilization: for each of up to 5 vehicles, count how many filtered bookings used it.
        List<Map<String, Object>> vehicleUtilization = vehicleRepository
                .findByAgentId(realAgentId).stream()
                .limit(5)
                .map(v -> {
                    long trips = filtered.stream()
                            .filter(b -> b.getVehicle() != null &&
                                    b.getVehicle().getId().equals(v.getId()))
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
     *
     * Filtering is based on Booking.createdAt.
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
                .filter(b -> b.getCreatedAt() != null &&
                        !b.getCreatedAt().toLocalDate().isBefore(finalFrom))
                .collect(Collectors.toList());
    }

    /**
     * Builds the revenue chart series (label/value entries) for the given period.
     * <p>
     * Current behavior:
     * - yearly: 12 month buckets (Jan..Dec) with computed completed-trip revenue per month
     * - quarterly: 12 week labels prefilled with zero
     * - monthly/default: 7 day labels (Mon..Sun) prefilled with zero
     */
    private List<Map<String, Object>> buildRevenueData(List<Booking> bookings, String period) {
        List<Map<String, Object>> result = new ArrayList<>();
        boolean isYearly = "yearly".equals(period);
        boolean isQuarterly = "quarterly".equals(period);

        if (isYearly) {
            String[] months = {"Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"};
            for (int i = 0; i < 12; i++) {
                final int month = i + 1;
                double revenue = bookings.stream()
                        .filter(b -> b.getStatus().equals("completed") &&
                                b.getCreatedAt() != null &&
                                b.getCreatedAt().getMonthValue() == month)
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                        .sum();
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", months[i]);
                m.put("value", revenue);
                result.add(m);
            }
        } else if (isQuarterly) {
            String[] weeks = {"Week 1","Week 2","Week 3","Week 4",
                    "Week 5","Week 6","Week 7","Week 8",
                    "Week 9","Week 10","Week 11","Week 12"};
            for (int i = 0; i < 12; i++) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", weeks[i]);
                m.put("value", 0);
                result.add(m);
            }
        } else {
            String[] days = {"Mon","Tue","Wed","Thu","Fri","Sat","Sun"};
            for (String day : days) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("label", day);
                m.put("value", 0);
                result.add(m);
            }
        }
        return result;
    }
}
