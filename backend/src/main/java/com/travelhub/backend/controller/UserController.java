package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.dto.response.UserProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.UserService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private Long resolveCurrentUserId() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims != null && claims.get("userId") != null) {
            try {
                return Long.valueOf(claims.get("userId").toString());
            } catch (Exception ignored) {}
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            return userRepository.findByEmail(auth.getName()).map(User::getId).orElse(null);
        }
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        Long userId = resolveCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.getProfile(userId);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        Long userId = resolveCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
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
                .currencyPreference(user.getCurrencyPreference())
                .build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody UpdatePasswordRequest request) {
        Long userId = resolveCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        userService.changePassword(userId, request, passwordEncoder);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }
}

