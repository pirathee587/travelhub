package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PackageRepository;
import org.springframework.stereotype.Service;

/**
 * AgentDashboardService provides a high-level summary of an agent's operational performance.
 * It aggregates counts for trips, resources, revenue, and quality metrics for the main agent dashboard view.
 */
@Service
public class AgentDashboardService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;

    /**
     * Constructor injection for all required repositories to aggregate dashboard data.
     */
    public AgentDashboardService(BookingRepository bookingRepository, VehicleRepository vehicleRepository, DriverRepository driverRepository, PackageRepository packageRepository, AgentRepository agentRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.packageRepository = packageRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Aggregates and returns core statistics for a specific agent's dashboard.
     * This includes trip counts by status, resource totals, total revenue, and average rating.
     */
    public AgentDashboardStatsResponse getStats(Long agentId) {

        // Count current active trips associated with the agent's vehicles
        long activeTrips = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "active").size();
        
        // Count total successful historical trips
        long completedTrips = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "completed").size();
        
        // Count new incoming reservation requests awaiting action
        long pendingRequests = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "pending").size();
        
        // Count total fleet resources
        long totalVehicles = vehicleRepository
                .findByAgentId(agentId).size();
        
        // Count total staff resources
        long totalDrivers = driverRepository
                .findByAgentId(agentId).size();
        
        // Total global packages (currently returns a system-wide count)
        long totalPackages = packageRepository.count();

        // Calculate total historical revenue from completed trips
        Double totalRevenue = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "completed")
                .stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        // Fetch current average rating for the agent profile
        Double averageRating = agentRepository.findById(agentId)
                .map(a -> a.getRating() != null ? a.getRating() : 0.0)
                .orElse(0.0);

        // Map calculated stats into the summary response DTO
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