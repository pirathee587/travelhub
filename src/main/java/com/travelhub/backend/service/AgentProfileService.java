package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.User;
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
    private final AgentRatingCalculator agentRatingCalculator;
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
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

<<<<<<< HEAD
        User user = agent.getOwner();

        // Agent-specific fields stay on Agent.
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : null);
=======
        // Map request fields -> agent profile fields.
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : (request.getAgentName() != null ? request.getAgentName().trim() : null));
        agent.setAgencyNumber(request.getPhone());
>>>>>>> develop
        agent.setSecondaryNumber(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());

<<<<<<< HEAD
        // Name & phone now live on User.
        if (request.getAgentName() != null) {
            user.setName(request.getAgentName());
        }
        if (request.getPhone() != null) {
            user.setTelephone(request.getPhone());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getNicImage() != null) {
            user.setNicImage(request.getNicImage());
=======
        // Update profile image only when explicitly provided.
        if (request.getProfileImage() != null && agent.getOwner() != null) {
            agent.getOwner().setProfileImage(request.getProfileImage());
            userRepository.save(agent.getOwner());
>>>>>>> develop
        }

        Agent saved = agentRepository.save(agent);
        return toResponse(saved);
    }

    /**
     * Maps Agent entity -> profile response DTO.
     * Common fields (name, email, phone, profileImage) now read through agent.getOwner().
     */
    private AgentProfileResponse toResponse(Agent agent) {
        User user = agent.getOwner();

        return AgentProfileResponse.builder()
                .id(agent.getId())
<<<<<<< HEAD
                .agentName(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .phone(user != null ? user.getTelephone() : null)
                .secondaryPhone(agent.getSecondaryNumber())
                .whatsappNumber(agent.getWhatsappNumber())
=======
                .agentName(agent.getAgencyName())
                .email(agent.getOwner() != null ? agent.getOwner().getEmail() : null)
                .phone(agent.getAgencyNumber() != null ? agent.getAgencyNumber() : (agent.getOwner() != null ? agent.getOwner().getTelephone() : null))
                .secondaryPhone(agent.getSecondaryNumber())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getAgencyName())
>>>>>>> develop
                .agencyName(agent.getAgencyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
<<<<<<< HEAD
                .profileImage(user != null ? user.getProfileImage() : null)
                .nicImage(user != null ? user.getNicImage() : null)
=======
                .profileImage(agent.getOwner() != null ? agent.getOwner().getProfileImage() : null)
>>>>>>> develop
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .rating(agentRatingCalculator.getAgentRating(agent.getId()))
                .totalTrips(agent.getTotalTrips())
                .totalRevenue(agent.getTotalRevenue())
                .completionRate(agent.getCompletionRate())
                .build();
    }
}
