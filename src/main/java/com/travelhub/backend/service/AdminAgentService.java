package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminAgentDetailResponse;
import com.travelhub.backend.dto.response.AdminAgentListResponse;
import com.travelhub.backend.dto.response.AdminAgentPackageResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.PackageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * AdminAgentService manages the administrative workflow for travel agents.
 * This includes reviewing applications, managing active status, and monitoring agent-specific packages.
 */
@Service
public class AdminAgentService {

    private final AgentRepository agentRepository;
    private final PackageRepository packageRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Constructor injection for repositories and event publisher.
     */
    public AdminAgentService(AgentRepository agentRepository, PackageRepository packageRepository, ApplicationEventPublisher eventPublisher) {
        this.agentRepository = agentRepository;
        this.packageRepository = packageRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Retrieves a list of all registered agents for the administrative overview.
     */
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    /**
     * Retrieves agents filtered by their application status (e.g., "Pending", "Approved").
     */
    public List<AdminAgentListResponse> getByStatus(String status) {
        return agentRepository
                .findByApplicationStatus(status)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    /**
     * Searches for agents using a keyword that matches name, email, or company name.
     */
    public List<AdminAgentListResponse> searchAgents(String keyword) {
        return agentRepository
                .searchAgents(keyword)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    /**
     * Retrieves full, detailed information for a specific agent.
     * Includes profile images, document links, and historical performance metrics.
     */
    public AdminAgentDetailResponse getAgentDetail(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));

        // Generate stylized initials for UI avatars
        String initials = generateInitials(agent.getUser().getName());

        // Format dates for display
        String memberSince = "";
        if (agent.getSubmittedDate() != null) {
            memberSince = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern("MMMM yyyy", Locale.ENGLISH));
        }

        String submittedDate = "";
        if (agent.getSubmittedDate() != null) {
            submittedDate = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        return new AdminAgentDetailResponse(
                agent.getId(),
                initials,
                agent.getUser().getName(),
                agent.getCompanyName(),
                agent.getUser().getProfileImage(),
                agent.getOwnerName(),
                agent.getUser().getEmail(),
                agent.getUser().getTelephone(),
                agent.getLocation(),
                memberSince,
                agent.getApplicationStatus() != null ? agent.getApplicationStatus() : "Pending",
                submittedDate,
                agent.getNicImageUrl(),
                agent.getRating(),
                agent.getTotalTrips(),
                agent.getExperienceYears(),
                agent.getIsActive()
        );
    }

    /**
     * Retrieves all travel packages managed by a specific agent for administrative review.
     */
    public List<AdminAgentPackageResponse> getAgentPackages(Long agentId) {
        agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));

        return packageRepository
                .findByAgentId(agentId)
                .stream()
                .map(this::mapToPackageResponse)
                .toList();
    }

    /**
     * Officially approves an agent's registration application.
     */
    @Transactional
    public AdminAgentDetailResponse approveAgent(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        
        agent.setApplicationStatus("Approved");
        
        // Synchronize with the underlying User account for login access
        if (agent.getUser() != null) {
            agent.getUser().setAgentApproved(true);
            agent.getUser().setStatus("ACTIVE");
            // Trigger approval notification
            eventPublisher.publishEvent(new UserAccountEvent(this, agent.getUser(), "APPROVED"));
        }
        
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    /**
     * Rejects an agent's registration application.
     */
    @Transactional
    public AdminAgentDetailResponse rejectAgent(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        
        agent.setApplicationStatus("Rejected");
        
        if (agent.getUser() != null) {
            agent.getUser().setAgentApproved(false);
            agent.getUser().setStatus("REJECTED");
            // Trigger rejection notification
            eventPublisher.publishEvent(new UserAccountEvent(this, agent.getUser(), "REJECTED", "Application did not meet requirements."));
        }
        
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    /**
     * Toggles the active status of an agent, effectively enabling or disabling their platform access.
     */
    public AdminAgentDetailResponse toggleActive(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        agent.setIsActive(!agent.getIsActive());
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    /**
     * Permanently deletes an agent's profile from the system.
     */
    public void deleteAgent(Long id) {
        agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", id));
        agentRepository.deleteById(id);
    }

    /**
     * Logic to generate 1-2 character initials from a full name or business name.
     */
    private String generateInitials(String name) {
        if (name == null || name.isBlank())
            return "?";
        String[] words = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String word : words) {
            if (!word.equals("&") && !word.equals("and") && !word.isEmpty()) {
                initials.append(Character.toUpperCase(word.charAt(0)));
                if (initials.length() == 2) break;
            }
        }
        return initials.toString();
    }

    /**
     * Maps an Agent entity to a summary response DTO for list views.
     */
    private AdminAgentListResponse mapToListResponse(Agent a) {
        String submittedDate = "";
        if (a.getSubmittedDate() != null) {
            submittedDate = a.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        return new AdminAgentListResponse(
                a.getId(),
                a.getUser().getName(),
                a.getCompanyName(),
                a.getOwnerName(),
                a.getUser().getEmail(),
                a.getUser().getTelephone(),
                a.getLocation(),
                a.getApplicationStatus() != null ? a.getApplicationStatus() : "Pending",
                submittedDate,
                a.getIsActive()
        );
    }

    /**
     * Maps a Package entity to a summary DTO for agent-specific package views.
     */
    private AdminAgentPackageResponse mapToPackageResponse(Package p) {
        return new AdminAgentPackageResponse(
                p.getId(),
                p.getPackageName(),
                p.getDestination(),
                p.getPriceFrom(),
                p.getPriceTo(),
                p.getDuration(),
                p.getCategory(),
                p.getRating(),
                p.getTrending(),
                p.getIsActive(),
                p.getApplicationStatus() != null ? p.getApplicationStatus() : "Pending"
        );
    }
}