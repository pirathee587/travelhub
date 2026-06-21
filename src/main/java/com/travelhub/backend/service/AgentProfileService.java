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
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AgentProfileService {

    private final AgentRepository agentRepository;
    private final BookingRepository bookingRepository;

    /**
     * Returns the profile details for the given agent id.
     * NOTE: agentId now equals the linked User's id (1:1 schema).
     */
    @Transactional
    public AgentProfileResponse getProfile(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
        return toResponse(agent);
    }

    /**
     * Updates editable profile fields for the given agent.
     * Name/email/phone/profileImage now live on the User entity.
     */
    @Transactional
    public AgentProfileResponse updateProfile(Long agentId, AgentProfileRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        User user = agent.getUser();

        // Agent-specific fields stay on Agent.
        agent.setAgencyName(request.getAgencyName() != null ? request.getAgencyName().trim() : null);
        agent.setSecondaryPhone(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());
        agent.setCompanyName(request.getCompanyName());

        // Name & phone now live on User.
        if (request.getAgentName() != null) {
            user.setName(request.getAgentName());
        }
        if (request.getPhone() != null) {
            user.setTelephone(request.getPhone());
        }

        // Profile image now lives on User.
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        Agent saved = agentRepository.save(agent);
        return toResponse(saved);
    }

    /**
     * Maps Agent entity -> profile response DTO.
     * Common fields (name, email, phone, profileImage) now read through agent.getUser().
     */
    private AgentProfileResponse toResponse(Agent agent) {
        User user = agent.getUser();

        return AgentProfileResponse.builder()
                .id(agent.getId())
                .agentName(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .phone(user != null ? user.getTelephone() : null)
                .secondaryPhone(agent.getSecondaryPhone())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getCompanyName())
                .agencyName(agent.getAgencyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .profileImage(user != null ? user.getProfileImage() : null)
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