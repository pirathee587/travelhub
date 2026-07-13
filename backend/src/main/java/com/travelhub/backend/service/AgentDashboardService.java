package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentDashboardService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;
    private final AgentRatingCalculator agentRatingCalculator;

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
                .build();
    }
}
