package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.travelhub.backend.repository.BookingRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentProfileService {

    private final AgentRepository agentRepository;
    private final AgentRatingCalculator agentRatingCalculator;

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
        agent.setAgencyName(request.getAgentName());
        agent.setPhone(request.getPhone());
        agent.setSecondaryPhone(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());
        agent.setCompanyName(request.getCompanyName());
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : null);

        // Update profile image only when explicitly provided.
        if (request.getProfileImage() != null) {
            agent.setProfileImage(request.getProfileImage());
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
                .email(agent.getEmail())
                .phone(agent.getPhone())
                .secondaryPhone(agent.getSecondaryPhone())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getCompanyName())
                .agencyName(agent.getAgencyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .profileImage(agent.getProfileImage())
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .rating(agentRatingCalculator.getAgentRating(agent.getId()))
                .totalTrips(agent.getTotalTrips())
                .totalRevenue(agent.getTotalRevenue())
                .completionRate(agent.getCompletionRate())
                .build();
    }
}
