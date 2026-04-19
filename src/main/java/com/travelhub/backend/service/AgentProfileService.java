package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AgentProfileRequest;
import com.travelhub.backend.dto.response.AgentProfileResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgentProfileService {

    private final AgentRepository agentRepository;

    public AgentProfileResponse getProfile(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
        return toResponse(agent);
    }

    public AgentProfileResponse updateProfile(Long agentId, AgentProfileRequest request) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));

        agent.setAgentName(request.getAgentName());
        agent.setPhone(request.getPhone());
        agent.setSecondaryPhone(request.getSecondaryPhone());
        agent.setWhatsappNumber(request.getWhatsappNumber());
        agent.setLocation(request.getLocation());
        agent.setBio(request.getBio());
        agent.setLanguages(request.getLanguages());
        agent.setOperatingDistricts(request.getOperatingDistricts());
        agent.setWebsiteUrl(request.getWebsiteUrl());
        agent.setCompanyName(request.getCompanyName());

        if (request.getProfileImage() != null) {
            agent.setProfileImage(request.getProfileImage());
        }

        Agent saved = agentRepository.save(agent);
        return toResponse(saved);
    }

    private AgentProfileResponse toResponse(Agent agent) {
        return AgentProfileResponse.builder()
                .id(agent.getId())
                .agentName(agent.getAgentName())
                .email(agent.getEmail())
                .phone(agent.getPhone())
                .secondaryPhone(agent.getSecondaryPhone())
                .whatsappNumber(agent.getWhatsappNumber())
                .companyName(agent.getCompanyName())
                .location(agent.getLocation())
                .bio(agent.getBio())
                .languages(agent.getLanguages())
                .operatingDistricts(agent.getOperatingDistricts())
                .websiteUrl(agent.getWebsiteUrl())
                .profileImage(agent.getProfileImage())
                .memberSince(agent.getMemberSince() != null ? agent.getMemberSince().toString() : null)
                .rating(agent.getRating())
                .totalTrips(agent.getTotalTrips())
                .totalRevenue(agent.getTotalRevenue())
                .completionRate(agent.getCompletionRate())
                .build();
    }
}