package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AgentDetailResponse;
import com.travelhub.backend.dto.response.AgentListResponse;
import com.travelhub.backend.dto.response.PackageResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AgentService {

    private final AgentRepository agentRepository;
    private final BookingRepository bookingRepository;
    private final PackageService packageService;
    private final AgentRatingCalculator agentRatingCalculator;

    private static final String STATUS_COMPLETED = "completed";

    /** Returns all Approved + active agents sorted A→Z by agencyName. */
    public List<AgentListResponse> getApprovedAgents() {
        List<Agent> agents = agentRepository.findAll()
                .stream()
                .filter(a -> a.getOwner() != null && Boolean.TRUE.equals(a.getOwner().getAgentApproved())
                        && Boolean.TRUE.equals(a.getIsActive()))
                .sorted(Comparator.comparing(
                        a -> a.getAgencyName() != null ? a.getAgencyName() : "",
                        String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        // Bulk dynamic rating + totalTrips calculation to avoid N+1 queries
        List<Long> agentIds = agents.stream().map(Agent::getId).collect(Collectors.toList());
        Map<Long, Double> ratingMap = agentRatingCalculator.getAgentRatings(agentIds);

        // Build totalTrips map: one query per agent (acceptable for list size)
        Map<Long, Long> totalTripsMap = agentIds.stream().collect(Collectors.toMap(
                agentId -> agentId,
                agentId -> bookingRepository.countByAgentIdAndStatus(agentId, STATUS_COMPLETED)
        ));

        return agents.stream()
                .map(a -> toListResponse(a, ratingMap.getOrDefault(a.getId(), 0.0),
                        totalTripsMap.getOrDefault(a.getId(), 0L).intValue()))
                .collect(Collectors.toList());
    }

    /** Returns a single agent profile with their approved active packages. */
    public AgentDetailResponse getAgentById(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Agent not found with id: " + id));

        if (agent.getOwner() == null || !Boolean.TRUE.equals(agent.getOwner().getAgentApproved())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Agent not found with id: " + id);
        }

        List<PackageResponse> packages = packageService.getPackagesByAgentId(id);

        // Compute live rating dynamically using AgentRatingCalculator
        Double computedRating = agentRatingCalculator.getAgentRating(id);

        // Dynamically count only COMPLETED bookings across all packages of this agent
        int computedTotalTrips = bookingRepository
                .countByAgentIdAndStatus(id, STATUS_COMPLETED)
                .intValue();

        return AgentDetailResponse.builder()
                .id(agent.getId())
                .agencyName(agent.getAgencyName())
                .agentName(agent.getOwner() != null ? agent.getOwner().getName() : null)
                .profileImage(agent.getOwner() != null ? agent.getOwner().getProfileImage() : null)
                .bio(agent.getBio())
                .location(agent.getLocation())
                .email(agent.getOwner() != null ? agent.getOwner().getEmail() : null)
                .phone(agent.getOwner() != null ? agent.getOwner().getTelephone() : null)
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getAgencyName())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .rating(computedRating)
                .totalTrips(computedTotalTrips)
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .packages(packages)
                .build();
    }

    private AgentListResponse toListResponse(Agent agent, Double computedRating, Integer computedTotalTrips) {
        return AgentListResponse.builder()
                .id(agent.getId())
                .agencyName(agent.getAgencyName())
                .agentName(agent.getOwner() != null ? agent.getOwner().getName() : null)
                .profileImage(agent.getOwner() != null ? agent.getOwner().getProfileImage() : null)
                .bio(agent.getBio())
                .location(agent.getLocation())
                .rating(computedRating)
                .totalTrips(computedTotalTrips)
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .build();
    }
}

