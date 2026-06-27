package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminAgentDetailResponse;
import com.travelhub.backend.dto.response.AdminAgentListResponse;
import com.travelhub.backend.dto.response.AdminAgentPackageResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAgentService {

    private final AgentRepository           agentRepository;
    private final PackageRepository         packageRepository;
    private final AgentRatingCalculator     agentRatingCalculator;
    private final UserRepository            userRepository;
    private final ApplicationEventPublisher eventPublisher;

    // ── Get All Agents ────────────────────────────────
    public List<AdminAgentListResponse> getAllAgents() {
        return agentRepository.findAll()
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Get Agents By Status ──────────────────────────
    public List<AdminAgentListResponse> getByStatus(
            String status) {
        List<Agent> agents;
        if ("Approved".equalsIgnoreCase(status)) {
            agents = agentRepository.findApprovedAgents();
        } else if ("Rejected".equalsIgnoreCase(status)) {
            agents = agentRepository.findRejectedAgents();
        } else {
            agents = agentRepository.findPendingAgents();
        }
        return agents.stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Search Agents ─────────────────────────────────
    public List<AdminAgentListResponse> searchAgents(
            String keyword) {
        return agentRepository
                .findByAgencyNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToListResponse)
                .toList();
    }

    // ── Get Agent Detail ──────────────────────────────
    // View Button click → Full detail page
    public AdminAgentDetailResponse getAgentDetail(
            Long id) {

        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));


        String initials = generateInitials(
                agent.getAgencyName());

        // Member Since format
        // LocalDateTime → "March 2020"
        String memberSince = "";
        if (agent.getSubmittedDate() != null) {
            memberSince = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "MMMM yyyy",
                            Locale.ENGLISH));
        }


        String submittedDate = "";
        if (agent.getSubmittedDate() != null) {
            submittedDate = agent.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "dd/MM/yyyy"));
        }

        return new AdminAgentDetailResponse(
                agent.getId(),
                agent.getOwner() != null ? agent.getOwner().getId() : null,
                initials,
                agent.getAgencyName(),
                agent.getAgencyName(),
                agent.getOwner() != null ? agent.getOwner().getProfileImage() : null,
                agent.getOwner() != null ? agent.getOwner().getName() : null,
                agent.getOwner() != null ? agent.getOwner().getEmail() : null,
                agent.getOwner() != null ? agent.getOwner().getTelephone() : null,
                agent.getLocation(),
                memberSince,
                agent.getOwner() != null && agent.getOwner().getAgentApproved() != null && agent.getOwner().getAgentApproved() ? "Approved" : ("REJECTED".equalsIgnoreCase(agent.getOwner() != null ? agent.getOwner().getStatus() : null) ? "Rejected" : "Pending"),
                submittedDate,
                agent.getOwner() != null ? agent.getOwner().getNicImage() : null,
                agent.getOwner() != null ? agent.getOwner().getNicNumber() : null,
                agent.getRating(),
                agent.getTotalTrips(),
                agent.getExperienceYears(),
                agent.getIsActive() != null && agent.getIsActive()
        );
    }

    // ── Get Agent Packages ────────────────────────────

    public List<AdminAgentPackageResponse>
    getAgentPackages(Long agentId) {

        agentRepository.findById(agentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", agentId));

        return packageRepository
                .findByAgentId(agentId)
                .stream()
                .map(this::mapToPackageResponse)
                .toList();
    }



    // ── Toggle Active ─────────────────────────────────
    @Transactional
    public AdminAgentDetailResponse toggleActive(
            Long id) {

        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));

        boolean newActiveState = !agent.getIsActive();

        // 1. Update the agents table
        agent.setIsActive(newActiveState);
        agentRepository.save(agent);

        // 2. Directly UPDATE the users table via JPQL — bypasses all lazy-proxy
        //    and Hibernate dirty-checking issues entirely
        userRepository.updateIsActiveByAgentId(id, newActiveState);

        return getAgentDetail(id);
    }


    // ── Delete Agent ──────────────────────────────────
    @Transactional
    public void deleteAgent(Long id) {
        agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));
        agentRepository.deleteById(id);
    }

    // ── Generate Initials ─────────────────────────────
    // "Pinnacle Tours & Travels" → "PT"
    private String generateInitials(String name) {
        if (name == null || name.isBlank())
            return "?";
        String[] words = name.trim().split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String word : words) {
            if (!word.equals("&")
                    && !word.equals("and")
                    && !word.isEmpty()) {
                initials.append(
                        Character.toUpperCase(
                                word.charAt(0)));
                if (initials.length() == 2) break;
            }
        }
        return initials.toString();
    }

    // ── Map Agent → List Response ─────────────────────
    private AdminAgentListResponse mapToListResponse(
            Agent a) {

        String submittedDate = "";
        if (a.getSubmittedDate() != null) {
            submittedDate = a.getSubmittedDate()
                    .format(DateTimeFormatter.ofPattern(
                            "dd/MM/yyyy"));
        }

        return new AdminAgentListResponse(
                a.getId(),
                a.getOwner() != null ? a.getOwner().getId() : null,
                a.getAgencyName(),
                a.getAgencyName(),
                a.getOwner() != null ? a.getOwner().getName() : null,
                a.getOwner() != null ? a.getOwner().getEmail() : null,
                a.getAgencyNumber() != null ? a.getAgencyNumber() : (a.getOwner() != null ? a.getOwner().getTelephone() : null),
                a.getLocation(),
                a.getOwner() != null && a.getOwner().getAgentApproved() != null && a.getOwner().getAgentApproved() ? "Approved" : ("REJECTED".equalsIgnoreCase(a.getOwner() != null ? a.getOwner().getStatus() : null) ? "Rejected" : "Pending"),
                submittedDate,
                a.getIsActive() != null && a.getIsActive()
        );
    }

    // ── Map Package → Response ────────────────────────
    private AdminAgentPackageResponse mapToPackageResponse(
            Package p) {
        // Pick first image from the images list, fall back to legacy imageUrl
        String coverImage = null;
        if (p.getImages() != null && !p.getImages().isEmpty()) {
            coverImage = p.getImages().stream()
                    .sorted((a, b) ->
                            (a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
                          - (b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                    .map(img -> img.getImageUrl())
                    .findFirst()
                    .orElse(p.getImageUrl());
        } else {
            coverImage = p.getImageUrl();
        }

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
                p.getApplicationStatus() != null
                        ? p.getApplicationStatus()
                        : "Pending",
                coverImage
        );
    }
}
