package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
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
    public ResponseEntity<User> getCurrentUser() {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }
        
        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = Long.valueOf(claims.get("userId").toString());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
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
