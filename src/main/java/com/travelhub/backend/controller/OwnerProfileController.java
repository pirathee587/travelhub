package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.service.OwnerProfileService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * OwnerProfileController manages the account and personal profile endpoints for hotel owners.
 * It provides tools for owners to view their registration details and manage their identity information.
 */
@RestController
@RequestMapping("/api/v1/owner/profile")
@CrossOrigin(origins = "*")
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;

    /**
     * Constructor injection for hotel owner profile business logic.
     */
    public OwnerProfileController(OwnerProfileService ownerProfileService) {
        this.ownerProfileService = ownerProfileService;
    }

    /**
     * Retrieves the comprehensive profile of the currently authenticated hotel owner.
     * Uses JWT claims to resolve the owner's user ID.
     */
    @GetMapping
    public ResponseEntity<OwnerProfileResponse> getProfile() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(ownerProfileService.getProfile(userId));
    }

    /**
     * Updates the text-based profile information for the authenticated hotel owner.
     */
    @PutMapping
    public ResponseEntity<OwnerProfileResponse> updateProfile(@RequestBody OwnerProfileRequest request) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(ownerProfileService.updateProfile(userId, request));
    }

    /**
     * Specifically handles the asynchronous upload of the owner's profile image.
     */
    @PostMapping("/image")
    public ResponseEntity<OwnerProfileResponse> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(ownerProfileService.uploadProfileImage(userId, file));
    }
}
