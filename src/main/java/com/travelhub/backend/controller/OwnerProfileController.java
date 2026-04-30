package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.service.OwnerProfileService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/owner/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnerProfileController {

    private final OwnerProfileService ownerProfileService;

    @GetMapping
    public ResponseEntity<OwnerProfileResponse> getProfile() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(ownerProfileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<OwnerProfileResponse> updateProfile(@RequestBody OwnerProfileRequest request) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(ownerProfileService.updateProfile(userId, request));
    }
}
