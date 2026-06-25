package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentProfileService {

    private final AgentRepository agentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Returns the profile details for the given agent id.
     */
    @Transactional
    public AgentProfileResponse getProfile(Long agentId) {
        // Load agent or fail if id is invalid.
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        return toResponse(agent);
    }

    /**
     * Updates editable profile fields for the given agent.
     */
    @Transactional
    public AgentProfileResponse updateProfile(Long agentId, AgentProfileRequest request) {
        // Load agent or fail if id is invalid.
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Map request fields -> agent profile fields.
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : (request.getAgentName() != null ? request.getAgentName().trim() : null));
        agent.setAgencyNumber(request.getPhone());
        agent.setSecondaryNumber(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());

        // Update profile image only when explicitly provided.
        if (request.getProfileImage() != null && agent.getOwner() != null) {
            agent.getOwner().setProfileImage(request.getProfileImage());
            userRepository.save(agent.getOwner());
        }

        // Persist and return updated profile response.
        Agent saved = agentRepository.save(agent);
        return toResponse(saved);
    }

    /**
     * Maps Agent entity -> profile response DTO.
     */
    private AgentProfileResponse toResponse(Agent agent) {
        return AgentProfileResponse.builder()
                .id(agent.getId())
                .agentName(agent.getAgencyName())
                .email(agent.getOwner() != null ? agent.getOwner().getEmail() : null)
                .phone(agent.getAgencyNumber() != null ? agent.getAgencyNumber() : (agent.getOwner() != null ? agent.getOwner().getTelephone() : null))
                .secondaryPhone(agent.getSecondaryNumber())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getAgencyName())
                .agencyName(agent.getAgencyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .profileImage(agent.getOwner() != null ? agent.getOwner().getProfileImage() : null)
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .rating(agent.getRating())
                // Total trips = completed bookings linked to this agent.
                .totalTrips((int) bookingRepository.findByAgentId(agent.getId())
                        .stream()
                        .filter(b -> b.getStatus().equals("completed"))
                        .count())
                .totalRevenue(agent.getTotalRevenue())
                .completionRate(agent.getCompletionRate())
                .build();
    }
}
