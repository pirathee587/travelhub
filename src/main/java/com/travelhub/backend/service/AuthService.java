package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.response.LoginResponse;
import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.common.ResourceNotFoundException;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final HotelRepository hotelRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public ApiResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public registration for ADMIN role is not allowed.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
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
                .nicNumber(request.getNicNumber())
                .hotelName(request.getHotelName())
                .businessRegistrationId(request.getBusinessRegistrationId())
                .businessAddress(request.getBusinessAddress())
                .district(request.getDistrict())
                .verificationToken(verificationToken)
                .isEmailVerified(request.getRole() == Role.TOURIST) // Auto-verify tourists
                .status(request.getRole() == Role.TOURIST ? "ACTIVE" : "PENDING") // Set to ACTIVE for tourists
                .isActive(true)
                .agentApproved(request.getRole() != Role.AGENT)
                .build();

        // Save User first to generate the ID (required for @MapsId child entities)
        user = userRepository.save(user);

        // Handle Role-specific profile creation
        if (user.getRole() == Role.AGENT) {
            Agent agent = Agent.builder()
                    .owner(user)      // link agent to user via owner entity
                    .agencyName(request.getAgencyName())
                    .isActive(true)
                    .build();
            
            agent = agentRepository.save(agent);
            user.setAgencies(java.util.List.of(agent));
        } else if (user.getRole() == Role.HOTEL_OWNER) {
            String defaultImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
            Hotel hotel = Hotel.builder()
                    .hotelName(user.getHotelName() != null ? user.getHotelName() : user.getName() + "'s Hotel")
                    .district(user.getDistrict())
                    .destination(user.getDistrict() != null ? user.getDistrict() : "Unknown")
                    .owner(user)
                    .ownerId(user.getId())
                    .ownerName(user.getName())
                    .ownerEmail(user.getEmail())
                    .ownerNic(user.getNicNumber())
                    .build();
            hotel = hotelRepository.save(hotel);
            user.setHotelId(hotel.getId());
            userRepository.save(user);
        }

        // Save User again to cascade the linked profile relationships
        user = userRepository.save(user);

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            // Log warning but don't fail registration
        }

        return new ApiResponse(true, "Registration successful! Please check your email for verification.");
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Email verification check from develop
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your email before logging in.");
        }

        // Account active check from develop
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact admin.");
        }

        // Agent approval check from develop
        if (user.getRole() == Role.AGENT && user.getAgentApproved() != null && !user.getAgentApproved()) {
            throw new UnauthorizedException("Your agent account is pending approval. Please wait for admin to approve.");
        }

        Long agentId = null;
        if (user.getRole() == Role.AGENT) {
            Agent agent = agentRepository.findByOwnerId(user.getId()).orElse(null);
            if (agent == null) {
                throw new UnauthorizedException("No Travel Agency profile associated with this account. Please register.");
            }
            agentId = agent.getId();
        }

        Long hotelId = null;
        if (user.getRole() == Role.HOTEL_OWNER) {
            Hotel hotel = hotelRepository.findByOwnerId(user.getId()).stream().findFirst().orElse(null);
            if (hotel == null) {
                throw new UnauthorizedException("No Hotel profile associated with this account. Please register.");
            }
            hotelId = hotel.getId();
        }

        String jwt = tokenProvider.generateToken(authentication, user);

        Long firstAgentId = null;
        if (user.getRole() == Role.AGENT && user.getAgencies() != null && !user.getAgencies().isEmpty()) {
            firstAgentId = user.getAgencies().get(0).getId();
        }

        return LoginResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .agentId(agentId)
                .hotelId(hotelId)
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
        return new ApiResponse(true, "Email verified successfully!");
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

    public ApiResponse resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        String verificationToken = user.getVerificationToken();
        if (verificationToken == null) {
            verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            userRepository.save(user);
        }

        emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        return new ApiResponse(true, "Verification email resent successfully.");
    }
}
