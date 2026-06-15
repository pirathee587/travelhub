package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AgentProfileService manages the professional and personal account details for travel agents.
 * It coordinates updates across the core User account and the specialized Agent profile information.
 */
@Service
@Transactional
public class AgentProfileService {

    private final AgentRepository agentRepository;
    private final UserRepository userRepository;

    /**
     * Constructor injection for agent and user data access.
     */
    public AgentProfileService(AgentRepository agentRepository, UserRepository userRepository) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the current comprehensive profile for a specific travel agent.
     */
    public AgentProfileResponse getProfile(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        return toResponse(agent);
    }

    /**
     * Updates an agent's profile information.
     * Synchronizes core user data (identity) and professional agent metadata (business details).
     */
    public AgentProfileResponse updateProfile(Long agentId, AgentProfileRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        // Update core User account details
        User user = agent.getUser();
        if (request.getAgentName() != null) user.setName(request.getAgentName());
        if (request.getPhone() != null) user.setTelephone(request.getPhone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        userRepository.save(user);

        // Update specialized Agent-specific professional metadata
        agent.setSecondaryPhone(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());
        agent.setCompanyName(request.getCompanyName());
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : null);

        Agent saved = agentRepository.save(agent);
        return toResponse(saved);
    }

    /**
     * Maps an Agent entity to a comprehensive response DTO.
     * Consolidates data from both the Agent and User entities, including aggregate performance metrics.
     */
    private AgentProfileResponse toResponse(Agent agent) {
        return AgentProfileResponse.builder()
                .id(agent.getId())
                .agentName(agent.getUser().getName())
                .email(agent.getUser().getEmail())
                .phone(agent.getUser().getTelephone())
                .secondaryPhone(agent.getSecondaryPhone())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getCompanyName())
                .agencyName(agent.getAgencyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .profileImage(agent.getUser().getProfileImage())
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .rating(agent.getRating())
                .totalTrips(agent.getTotalTrips())
                .totalRevenue(agent.getTotalRevenue())
                .completionRate(agent.getCompletionRate())
                .build();
    }
}
