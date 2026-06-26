package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.OwnerSessionResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Provides a lightweight session-check endpoint for the hotel-owner frontend.
 * The frontend calls GET /api/v1/owner/session with an X-Owner-Id header
 * (mock mode) or a Bearer JWT (real auth).  Both paths are handled here.
 */
@RestController
@RequestMapping("/api/v1/owner/session")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnerSessionController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<OwnerSessionResponse> getSession(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId,
            java.security.Principal principal) {

        Long resolvedId = null;

        // Prefer real JWT principal over mock header
        if (principal != null) {
            try {
                resolvedId = Long.parseLong(principal.getName());
            } catch (NumberFormatException ignored) {
                // principal.getName() is an email, not an id — fall through to header
            }
        }

        if (resolvedId == null) {
            resolvedId = ownerId;
        }

        if (resolvedId == null) {
            return ResponseEntity.status(401).body(
                OwnerSessionResponse.builder()
                    .accessGranted(false)
                    .message("No owner identity provided. Please log in.")
                    .build()
            );
        }

        Optional<User> userOpt = userRepository.findById(resolvedId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(
                OwnerSessionResponse.builder()
                    .accessGranted(false)
                    .message("Owner account not found (id=" + resolvedId + ").")
                    .build()
            );
        }

        User user = userOpt.get();

        // accessGranted = user is active AND role is HOTEL_OWNER or ADMIN
        boolean isOwnerRole = "HOTEL_OWNER".equalsIgnoreCase(
                user.getRole() != null ? user.getRole().name() : "");
        boolean isAdmin = "ADMIN".equalsIgnoreCase(
                user.getRole() != null ? user.getRole().name() : "");
        boolean isActive = Boolean.TRUE.equals(user.getIsActive());
        boolean accessGranted = (isOwnerRole || isAdmin) && isActive;

        String message = accessGranted
                ? "Access granted."
                : (!isOwnerRole && !isAdmin)
                    ? "This account does not have hotel-owner privileges."
                    : "Account is inactive. Contact support.";

        return ResponseEntity.ok(
            OwnerSessionResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus())
                .isActive(user.getIsActive())
                .isApproved(true) // owners don't have a separate approval flag; use isActive
                .accessGranted(accessGranted)
                .message(message)
                .build()
        );
    }
}
