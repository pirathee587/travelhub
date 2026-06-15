package com.travelhub.backend.service;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.request.ChangePasswordRequest;
import com.travelhub.backend.dto.request.ForgotPasswordRequest;
import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.response.LoginResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * AuthService handles all operations related to user identity and security.
 * This includes registration, login, email verification, and password management.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AgentRepository agentRepository;
    private final HotelRepository hotelRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    /**
     * Constructor injection for required dependencies.
     */
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, AuthenticationManager authenticationManager, EmailService emailService, AgentRepository agentRepository, HotelRepository hotelRepository, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.agentRepository = agentRepository;
        this.hotelRepository = hotelRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Registers a new user in the system.
     * Handles role-specific profile creation for Agents and Hotel Owners.
     */
    @Transactional
    public ApiResponse register(RegisterRequest request) {
        // Ensure email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        // Prevent public registration as ADMIN
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public registration for ADMIN role is not allowed");
        }

        // Generate token for email verification
        String verificationToken = UUID.randomUUID().toString();

        // Initialize core user entity
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTelephone(request.getTelephone());
        user.setRole(request.getRole());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setNationality(request.getNationality());
        user.setVerificationToken(verificationToken);
        user.setEmailVerified(false);
        user.setStatus("PENDING");
        user.setIsActive(true);
        // Agents and Hotel Managers require manual admin approval; other roles (Tourists) are pre-approved
        boolean requiresApproval = request.getRole() == Role.AGENT || request.getRole() == Role.HOTEL_OWNER;
        user.setAgentApproved(!requiresApproval);

        // Link Role-specific profile before saving
        if (user.getRole() == Role.AGENT) {
            Agent agent = new Agent();
            agent.setUser(user);
            agent.setAgencyName(request.getAgencyName());
            agent.setLicenseNumber(request.getLicenseNumber());
            agent.setCompanyName(request.getAgencyName());
            agent.setIsActive(true);
            user.setAgentProfile(agent);
        } else if (user.getRole() == Role.HOTEL_OWNER) {
            Hotel hotel = new Hotel();
            hotel.setOwner(user);
            hotel.setHotelName(request.getHotelName() != null ? request.getHotelName() : user.getName() + "'s Hotel");
            hotel.setDistrict(request.getDistrict());
            hotel.setHotelEmail(user.getEmail());
            hotel.setHotelContactNumber(user.getTelephone());
            hotel.setOwnerNic(request.getNic());
            
            if (user.getOwnedHotels() == null) {
                user.setOwnedHotels(new java.util.ArrayList<>());
            }
            user.getOwnedHotels().add(hotel);
        }

        // Save User (cascades will save linked Agent or Hotel entities)
        user = userRepository.save(user);

        // Attempt to send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            return new ApiResponse(true, "User registered successfully, but verification email could not be sent. Please contact support.");
        }

        return new ApiResponse(true, "User registered successfully. Please check your email for verification.");
    }

    /**
     * Authenticates a user and returns a JWT token.
     * Performs various status checks (verification, active status, approval).
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // Standard Spring Security authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Fetch user details for status verification
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Security check: Email must be verified
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your email first");
        }

        // Security check: Account must be active
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact admin.");
        }

        // Security check: Business users (Agents/Hotel Managers) must be approved by an administrator
        if ((user.getRole() == Role.AGENT || user.getRole() == Role.HOTEL_OWNER) 
            && user.getAgentApproved() != null && !user.getAgentApproved()) {
            String roleName = user.getRole() == Role.AGENT ? "agent" : "hotel manager";
            throw new UnauthorizedException("Your " + roleName + " account is pending approval. Please wait for admin to approve.");
        }

        // Generate the JWT for the session
        String jwt = tokenProvider.generateToken(authentication, user);

        // Build the response DTO
        LoginResponse response = new LoginResponse();
        response.setToken(jwt);
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setProfileImage(user.getProfileImage());
        response.setId(user.getId());
        
        // Include specific profile IDs for frontend routing convenience
        if (user.getAgentProfile() != null) {
            response.setAgentId(user.getAgentProfile().getId());
        }
        if (user.getOwnedHotels() != null && !user.getOwnedHotels().isEmpty()) {
            response.setHotelId(user.getOwnedHotels().get(0).getId());
        }
        
        return response;
    }

    /**
     * Verifies a user's email using the provided token.
     */
    public ApiResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User", "verificationToken", token));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        
        // Tourists become active immediately upon email verification
        if (user.getRole() == Role.TOURIST) {
            user.setStatus("ACTIVE");
            user.setIsActive(true);
        }

        userRepository.save(user);

        // Publish event for downstream notifications
        eventPublisher.publishEvent(new com.travelhub.backend.event.UserAccountEvent(this, user, "VERIFIED"));

        return new ApiResponse(true, "Email verified successfully. You can now login.");
    }

    /**
     * Initiates the password reset process by generating a token and sending an email.
     */
    public ApiResponse requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        // Token is valid for 1 hour
        user.setPasswordResetExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return new ApiResponse(true, "Password reset link sent to your email.");
    }

    /**
     * Resets the user's password using a valid reset token.
     */
    public ApiResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        // Check if token has expired
        if (user.getPasswordResetExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        userRepository.save(user);

        return new ApiResponse(true, "Password reset successfully. You can now login with your new password.");
    }

    /**
     * Changes a logged-in user's password after validating their current password.
     */
    @Transactional
    public ApiResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Validate current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Ensure new password and confirmation match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new ApiResponse(true, "Password changed successfully");
    }
}
