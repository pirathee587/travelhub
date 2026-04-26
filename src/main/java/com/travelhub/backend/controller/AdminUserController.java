package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // GET /api/admin/users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Users found",
                        adminUserService.getAllUsers()));
    }

    // GET /api/admin/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "User found",
                        adminUserService.getUserById(id)));
    }

    // GET /api/admin/users/role?role=AGENT
    @GetMapping("/role")
    public ResponseEntity<?> getUsersByRole(
            @RequestParam String role) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Users found",
                        adminUserService.getUsersByRole(role)));
    }

    // GET /api/admin/users/search?keyword=eric
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Search results",
                        adminUserService.searchUsers(keyword)));
    }

    // GET /api/admin/users/pending-agents
    @GetMapping("/pending-agents")
    public ResponseEntity<?> getPendingAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Pending agents",
                        adminUserService.getPendingAgents()));
    }

    // PATCH /api/admin/users/{id}/toggle-active
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "User status updated",
                        adminUserService.toggleUserActive(id)));
    }

    // PATCH /api/admin/users/agents/{id}/approve
    @PatchMapping("/agents/{id}/approve")
    public ResponseEntity<?> approveAgent(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent approved",
                        adminUserService.approveAgent(id)));
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "User deleted", null));
    }
}