package com.travelhub.backend.service;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.UnauthorizedException;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AgentRepository agentRepository;
    private final HotelRepository hotelRepository;

    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .role(request.getRole())
                .preferredLanguage(request.getPreferredLanguage())
                .nationality(request.getNationality())
                .agencyName(request.getAgencyName())
                .licenseNumber(request.getLicenseNumber())
                .hotelName(request.getHotelName())
                .businessRegistrationId(request.getBusinessRegistrationId())
                .businessAddress(request.getBusinessAddress())
                .district(request.getDistrict())
                .verificationToken(verificationToken)
                .isEmailVerified(request.getRole() == Role.TOURIST) // Auto-verify tourists
                .status("ACTIVE") // Set to ACTIVE for tourists
                .isActive(true)
                .agentApproved(request.getRole() != Role.AGENT)
                .build();

        // Save User first to generate the ID (required for @MapsId child entities)
        user = userRepository.save(user);

        // Handle Role-specific profile creation
        if (user.getRole() == Role.AGENT) {
            // Note: The teammate MUST update Agent.java to include the 'user' field and remove 'email'/'phone'
            // for this to compile successfully.
            Agent agent = Agent.builder()
                    // .user(user) // UNCOMMENT THIS once teammate adds the 'user' field in Agent.java
                    .agencyName(user.getAgencyName())
                    .isActive(true)
                    .build();
            
            // agent.setUser(user); // Alternative if using setters
            user.setAgentProfile(agent);
            agentRepository.save(agent);
        } else if (user.getRole() == Role.HOTEL_OWNER) {
            Hotel hotel = Hotel.builder()
                    .hotelName(user.getHotelName() != null ? user.getHotelName() : user.getName() + "'s Hotel")
                    .district(user.getDistrict())
                    .build();
            hotel = hotelRepository.save(hotel);
            user.setHotelId(hotel.getId());
        }

        // Save User again to cascade the linked profile relationships
        user = userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            return new ApiResponse(true, "User registered successfully, but verification email could not be sent. Please contact support.");
        }

        return new ApiResponse(true, "User registered successfully. " + (request.getRole() == Role.TOURIST ? "You can now make bookings!" : "Please check your email for verification."));
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your email first");
        }

        // Account active check from develop
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact admin.");
        }

        // Agent approval check from develop
        if (user.getRole() == Role.AGENT && user.getAgentApproved() != null && !user.getAgentApproved()) {
            throw new UnauthorizedException("Your agent account is pending approval. Please wait for admin to approve.");
        }

        String jwt = tokenProvider.generateToken(authentication, user);

        return LoginResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .agentId(user.getAgentId())
                .hotelId(user.getHotelId())
                .id(user.getId())
                .build();
    }

    public ApiResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User", "verificationToken", token));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        
        // Tourists are activated immediately after email verification
        if (user.getRole() == Role.TOURIST) {
            user.setStatus("ACTIVE");
            user.setIsActive(true);
        }

        userRepository.save(user);
        return new ApiResponse(true, "Email verified successfully. You can now login.");
    }

    public ApiResponse requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return new ApiResponse(true, "Password reset link sent to your email.");
    }

    public ApiResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getPasswordResetExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        userRepository.save(user);

        return new ApiResponse(true, "Password reset successfully. You can now login with your new password.");
    }
}
