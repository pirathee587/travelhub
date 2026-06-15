package com.travelhub.backend.service;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.dto.response.AdminPendingUserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * AdminUserService provides administrative-only user management operations.
 * It is primarily used to securely create additional system administrators.
 */
@Service
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Constructor injection for user data access and security encoding.
     */
    public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new user with the ADMIN role.
     * Unlike public registration, these accounts are pre-verified and active by default.
     */
    public ApiResponse createAdminUser(RegisterRequest request) {
        // Ensure email uniqueness before proceeding
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        // Initialize the administrative user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Securely encode the provided password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setTelephone(request.getTelephone());
        
        // Force the role to ADMIN regardless of what was in the request
        user.setRole(Role.ADMIN);
        
        // Default configuration for administrative users
        user.setPreferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "en");
        user.setEmailVerified(true); // Bypass verification email for admin-created accounts
        user.setStatus("ACTIVE");
        user.setIsActive(true);

        userRepository.save(user);

        return new ApiResponse(true, "Admin user created successfully");
}
    /**
     * Retrieves all business users (Agents and Hotel Owners) awaiting administrative approval.
     */
    public List<AdminPendingUserResponse> getPendingBusinessUsers() {
        List<User> pendingAgents = userRepository.findByRoleAndAgentApprovedFalse(Role.AGENT);
        List<User> pendingHotels = userRepository.findByRoleAndAgentApprovedFalse(Role.HOTEL_OWNER);

        return Stream.concat(pendingAgents.stream(), pendingHotels.stream())
                .map(this::mapToPendingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps a User entity to a pending application response DTO.
     */
    private AdminPendingUserResponse mapToPendingResponse(User user) {
        String licenseNumber = null;
        String hotelName = null;

        if (user.getRole() == Role.AGENT && user.getAgentProfile() != null) {
            licenseNumber = user.getAgentProfile().getLicenseNumber();
        } else if (user.getRole() == Role.HOTEL_OWNER && user.getOwnedHotels() != null && !user.getOwnedHotels().isEmpty()) {
            hotelName = user.getOwnedHotels().get(0).getHotelName();
        }

        return new AdminPendingUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getTelephone(),
                user.getRole(),
                licenseNumber,
                hotelName
        );
    }
}
