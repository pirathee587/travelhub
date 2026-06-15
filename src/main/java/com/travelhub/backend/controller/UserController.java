package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.service.UserService;
import com.travelhub.backend.util.SecurityUtils;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * UserController handles operations related to the currently authenticated user's account.
 * It provides endpoints for profile retrieval and account security management.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /**
     * Constructor injection for user profile business logic.
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves the comprehensive profile of the currently logged-in user.
     * Uses JWT claims to resolve the user's identity.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }
        
        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /**
     * Updates the personal profile information for the authenticated user.
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    /**
     * Changes the authenticated user's password after verifying the current one.
     */
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
