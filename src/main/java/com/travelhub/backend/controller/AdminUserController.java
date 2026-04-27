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
@CrossOrigin(origins = "*") // Note: Replace "*" with your Vercel URL in production
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Users found", adminUserService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "User found", adminUserService.getUserById(id)));
    }

    @GetMapping("/role")
    public ResponseEntity<?> getUsersByRole(@RequestParam String role) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Users found", adminUserService.getUsersByRole(role)));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Search results", adminUserService.searchUsers(keyword)));
    }

    @GetMapping("/pending-agents")
    public ResponseEntity<?> getPendingAgents() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Pending agents", adminUserService.getPendingAgents()));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "User status updated", adminUserService.toggleUserActive(id)));
    }

    @PatchMapping("/agents/{id}/approve")
    public ResponseEntity<?> approveAgent(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Agent approved", adminUserService.approveAgent(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "User deleted", null));
    }
}