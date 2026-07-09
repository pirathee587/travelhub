package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.dto.response.UserProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.service.UserService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = Long.valueOf(claims.get("userId").toString());
        User user = userService.getProfile(userId);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = Long.valueOf(claims.get("userId").toString());
        User user = userService.updateProfile(userId, request);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .profileImage(user.getProfileImage())
                .nationality(user.getNationality())
                .preferredLanguage(user.getPreferredLanguage())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody UpdatePasswordRequest request,
                                           PasswordEncoder passwordEncoder) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        userService.changePassword(userId, request, passwordEncoder);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }
}
