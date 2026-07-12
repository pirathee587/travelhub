package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost
        .PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/agents")
@RequiredArgsConstructor

@PreAuthorize("hasRole('ADMIN')")
public class AdminAgentController {

    private final AdminAgentService adminAgentService;

    // ── GET /api/admin/agents ─────────────────────────
    // All agents list
    @GetMapping
    public ResponseEntity<?> getAllAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agents found",
                        adminAgentService.getAllAgents()));
    }

    // ── GET /api/admin/agents/search?keyword= ─────────
    @GetMapping("/search")
    public ResponseEntity<?> searchAgents(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Search results",
                        adminAgentService
                                .searchAgents(keyword)));
    }

    // ── GET /api/admin/agents/{id} ────────────────────
    // View Button click → Full detail page
    @GetMapping("/{id}")
    public ResponseEntity<?> getAgentDetail(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent detail",
                        adminAgentService
                                .getAgentDetail(id)));
    }

    // ── GET /api/admin/agents/{id}/packages ───────────
    // Packages Button click
    @GetMapping("/{id}/packages")
    public ResponseEntity<?> getAgentPackages(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent packages",
                        adminAgentService
                                .getAgentPackages(id)));
    }

    // ── PATCH /api/admin/agents/{id}/toggle-active ────
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent updated",
                        adminAgentService
                                .toggleActive(id)));
    }

    // ── DELETE /api/admin/agents/{id} ─────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgent(
            @PathVariable Long id) {
        adminAgentService.deleteAgent(id);
        return ResponseEntity.ok(
                new ApiResponse(true,
                        "Agent deleted", null));
    }
}