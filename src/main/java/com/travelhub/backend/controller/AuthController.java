package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.ChangePasswordRequest;
import com.travelhub.backend.dto.request.ForgotPasswordRequest;
import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.request.ResetPasswordRequest;
import com.travelhub.backend.dto.response.LoginResponse;
import com.travelhub.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

/**
 * AuthController manages all security-related REST endpoints.
 * It provides a public entry point for user onboarding and session management.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    /**
     * Constructor injection for the authentication business logic.
     */
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint for new user registration.
     * Supports various roles and validates the input request body.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint for user authentication and JWT generation.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint for email verification via a unique token sent to the user.
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam String token) {
        ApiResponse response = authService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint to initiate the password recovery process.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ApiResponse response = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint to finalize the password reset using a recovery token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        ApiResponse response = authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(response);
    }

    /**
     * Secured endpoint for authenticated users to update their password.
     * Uses the security Principal to identify the calling user.
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        ApiResponse response = authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(response);
    }
}
