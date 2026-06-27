package com.travelhub.backend.controller;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.service.OwnerAccessService;
import com.travelhub.backend.service.OwnerProfileService;
import com.travelhub.backend.util.OwnerContextResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/owner/profile")
@RequiredArgsConstructor
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;
    private final OwnerAccessService ownerAccessService;
    private final OwnerContextResolver ownerContextResolver;

    @GetMapping
    public ResponseEntity<OwnerProfileResponse> getProfile(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerProfileService.getProfile(ownerId));
    }

    @PutMapping
    public ResponseEntity<OwnerProfileResponse> updateProfile(
            @RequestBody OwnerProfileRequest request,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerProfileService.updateProfile(ownerId, request));
    }

    @PostMapping("/image")
    public ResponseEntity<OwnerProfileResponse> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerProfileService.uploadProfileImage(ownerId, file));
    }

    private Long requireOwnerId(Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) {
            throw new BadRequestException("No owner identity provided. Set X-Owner-Id header or authenticate.");
        }
        return ownerId;
    }
}
