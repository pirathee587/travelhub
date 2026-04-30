package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AgentDashboardStatsResponse;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgentDashboardService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PackageRepository packageRepository;
    private final AgentRepository agentRepository;

    public AgentDashboardStatsResponse getStats(Long agentId) {

        long activeTrips = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "active").size();
        long completedTrips = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "completed").size();
        long pendingRequests = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "pending").size();
        long totalVehicles = vehicleRepository
                .findByAgentId(agentId).size();
        long totalDrivers = driverRepository
                .findByAgentId(agentId).size();
        long totalPackages = packageRepository.count();

        Double totalRevenue = bookingRepository
                .findByVehicleAgentIdAndStatus(agentId, "completed")
                .stream()
                .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice() : 0)
                .sum();

        Double averageRating = agentRepository.findById(agentId)
                .map(a -> a.getRating())
                .orElse(0.0);

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