package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.service.OwnerProfileService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/owner/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;

    @GetMapping
    public ResponseEntity<OwnerProfileResponse> getProfile(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId,
            java.security.Principal principal) {
        Long resolvedId = resolveOwnerId(principal, ownerId);
        if (resolvedId == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(ownerProfileService.getProfile(resolvedId));
    }

    @PutMapping
    public ResponseEntity<OwnerProfileResponse> updateProfile(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId,
            java.security.Principal principal,
            @RequestBody OwnerProfileRequest request) {
        Long resolvedId = resolveOwnerId(principal, ownerId);
        if (resolvedId == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(ownerProfileService.updateProfile(resolvedId, request));
    }

    @PostMapping("/image")
    public ResponseEntity<OwnerProfileResponse> uploadProfileImage(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId,
            java.security.Principal principal,
            @RequestParam("file") MultipartFile file) {
        Long resolvedId = resolveOwnerId(principal, ownerId);
        if (resolvedId == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(ownerProfileService.uploadProfileImage(resolvedId, file));
    }

    private Long resolveOwnerId(java.security.Principal principal, Long ownerId) {
        if (principal != null) {
            try {
                return Long.parseLong(principal.getName());
            } catch (NumberFormatException ignored) {
                // If principal name is an email or username, try JWT claims.
                Claims claims = SecurityUtils.getCurrentUserClaims();
                if (claims != null && claims.get("userId") != null) {
                    return Long.valueOf(claims.get("userId").toString());
                }
            }
        }
        return ownerId;
    }
}
