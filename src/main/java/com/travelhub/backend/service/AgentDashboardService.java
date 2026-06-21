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

    @Transactional
    public AgentDashboardStatsResponse getStats(Long agentId) {

        long activeTrips = bookingRepository.findByAgentId(agentId)
                .stream()
                .filter(b -> b.getStatus().equals("active") ||
                        b.getStatus().equals("confirmed") ||
                        b.getStatus().equals("in_progress") ||
                        b.getStatus().equals("In_progress"))
                .count();

        long completedTrips = bookingRepository
                .findByAgentIdAndStatus(agentId, "completed").size();
        long pendingRequests = bookingRepository
                .findByAgentIdAndStatus(agentId, "pending").size();
        long totalVehicles = vehicleRepository
                .findByAgentId(agentId).size();
        long totalDrivers = driverRepository
                .findByAgentId(agentId).size();
        long totalPackages = packageRepository.countByAgentId(agentId);

        Double totalRevenue = bookingRepository
                .findByAgentIdAndStatus(agentId, "completed")
                .stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        Double averageRating = agentRatingCalculator.getAgentRating(agentId);

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