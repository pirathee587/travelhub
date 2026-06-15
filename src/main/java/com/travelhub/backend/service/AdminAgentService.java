package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminAgentDetailResponse;
import com.travelhub.backend.dto.response.AdminAgentListResponse;
import com.travelhub.backend.dto.response.AdminAgentPackageResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminAgentService {

    private final AgentRepository   agentRepository;
    private final PackageRepository packageRepository;

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
        return agentRepository
                .findByApplicationStatus(status)
                .stream()
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
                initials,
                agent.getAgencyName(),
                agent.getCompanyName(),
                agent.getProfileImage(),
                agent.getOwnerName(),
                agent.getEmail(),
                agent.getPhone(),
                agent.getLocation(),
                memberSince,
                agent.getApplicationStatus() != null
                        ? agent.getApplicationStatus()
                        : "Pending",
                submittedDate,
                agent.getNicImageUrl(),
                agent.getRating(),
                agent.getTotalTrips(),
                agent.getExperienceYears(),
                agent.getIsActive()
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

    // ── Approve Agent ─────────────────────────────────
    public AdminAgentDetailResponse approveAgent(
            Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));
        agent.setApplicationStatus("Approved");
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    // ── Reject Agent ──────────────────────────────────
    public AdminAgentDetailResponse rejectAgent(
            Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));
        agent.setApplicationStatus("Rejected");
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    // ── Toggle Active ─────────────────────────────────
    public AdminAgentDetailResponse toggleActive(
            Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Agent", "id", id));
        agent.setIsActive(!agent.getIsActive());
        agentRepository.save(agent);
        return getAgentDetail(id);
    }

    // ── Delete Agent ──────────────────────────────────
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
                a.getAgencyName(),
                a.getCompanyName(),
                a.getOwnerName(),
                a.getEmail(),
                a.getPhone(),
                a.getLocation(),
                a.getApplicationStatus() != null
                        ? a.getApplicationStatus()
                        : "Pending",
                submittedDate,
                a.getIsActive()
        );
    }

    // ── Map Package → Response ────────────────────────
    private AdminAgentPackageResponse mapToPackageResponse(
            Package p) {
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
                        : "Pending"
        );
    }
}
