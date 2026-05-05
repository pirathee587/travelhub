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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AgentRepository agentRepository;
    private final HotelRepository hotelRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, AuthenticationManager authenticationManager, EmailService emailService, AgentRepository agentRepository, HotelRepository hotelRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.agentRepository = agentRepository;
        this.hotelRepository = hotelRepository;
    }

    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        String verificationToken = UUID.randomUUID().toString();

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
        user.setAgentApproved(request.getRole() != Role.AGENT);

        // Save User first to generate ID
        user = userRepository.save(user);

        // Handle Role-specific profile creation
        if (user.getRole() == Role.AGENT) {
            Agent agent = new Agent();
            agent.setUser(user); // Link to User (MapsId will use user's ID)
            agent.setAgencyName(request.getAgencyName());
            agent.setLicenseNumber(request.getLicenseNumber());
            agent.setCompanyName(request.getAgencyName()); // Fallback
            agent.setIsActive(true);
            agentRepository.save(agent);
        } else if (user.getRole() == Role.HOTEL_OWNER) {
            Hotel hotel = new Hotel();
            hotel.setOwner(user); // Link to User
            hotel.setHotelName(request.getHotelName() != null ? request.getHotelName() : user.getName() + "'s Hotel");
            hotel.setDistrict(request.getDistrict());
            hotel.setHotelEmail(user.getEmail());
            hotel.setHotelContactNumber(user.getTelephone());
            hotelRepository.save(hotel);
        }

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            return new ApiResponse(true, "User registered successfully, but verification email could not be sent. Please contact support.");
        }

        return new ApiResponse(true, "User registered successfully. Please check your email for verification.");
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

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact admin.");
        }

        if (user.getRole() == Role.AGENT && user.getAgentApproved() != null && !user.getAgentApproved()) {
            throw new UnauthorizedException("Your agent account is pending approval. Please wait for admin to approve.");
        }

        String jwt = tokenProvider.generateToken(authentication, user);

        LoginResponse response = new LoginResponse();
        response.setToken(jwt);
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setProfileImage(user.getProfileImage());
        response.setId(user.getId());
        
        // Return IDs if profiles exist
        if (user.getAgentProfile() != null) {
            response.setAgentId(user.getAgentProfile().getId());
        }
        if (user.getOwnedHotels() != null && !user.getOwnedHotels().isEmpty()) {
            response.setHotelId(user.getOwnedHotels().get(0).getId());
        }
        
        return response;
    }

    public ApiResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User", "verificationToken", token));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        
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
