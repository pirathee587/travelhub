package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminAgentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AdminAgentController manages the lifecycle and auditing of travel agents from an administrative perspective.
 * It provides tools for reviewing agent applications, managing their platform status, and auditing their inventory.
 * Access is strictly restricted to users with the 'ADMIN' role.
 */
@RestController
@RequestMapping("/api/admin/agents")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAgentController {

    private final AdminAgentService adminAgentService;

    /**
     * Constructor injection for administrative agent business logic.
     */
    public AdminAgentController(AdminAgentService adminAgentService) {
        this.adminAgentService = adminAgentService;
    }

    /**
     * Retrieves the complete list of all travel agents registered on the platform.
     */
    @GetMapping
    public ResponseEntity<?> getAllAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agents found",
                        adminAgentService.getAllAgents()));
    }

    /**
     * Retrieves travel agents filtered by their application or account status (e.g., 'Pending', 'Approved').
     */
    @GetMapping("/status")
    public ResponseEntity<?> getByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agents found",
                        adminAgentService.getByStatus(status)));
    }

    /**
     * Performs a keyword-based search across agent profiles (Name, Agency, License, etc.).
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchAgents(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Search results",
                        adminAgentService.searchAgents(keyword)));
    }

    /**
     * Retrieves the comprehensive profile and business details for a specific agent.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAgentDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent detail",
                        adminAgentService.getAgentDetail(id)));
    }

    /**
     * Retrieves the full list of travel packages managed by a specific agent for administrative audit.
     */
    @GetMapping("/{id}/packages")
    public ResponseEntity<?> getAgentPackages(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent packages",
                        adminAgentService.getAgentPackages(id)));
    }

    /**
     * Endpoint to approve a pending agent application, granting them platform access.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveAgent(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent approved",
                        adminAgentService.approveAgent(id)));
    }

    /**
     * Endpoint to reject an agent application.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectAgent(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent rejected",
                        adminAgentService.rejectAgent(id)));
    }

    /**
     * Toggles an agent's account activity status (e.g., to suspend an account for policy violations).
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent updated",
                        adminAgentService.toggleActive(id)));
    }

    /**
     * Endpoint to permanently remove an agent and their associated data from the platform.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgent(
            @PathVariable Long id) {
        adminAgentService.deleteAgent(id);
        return ResponseEntity.ok(
                new ApiResponse(true,
                        "Agent deleted", null));
    }
}