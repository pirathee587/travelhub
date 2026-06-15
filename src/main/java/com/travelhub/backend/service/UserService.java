package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * UserService manages standard user profile operations.
 * This includes retrieving profile information, updating personal details, and changing passwords.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /**
     * Constructor injection for the user repository.
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Updates the profile information of an existing user.
     * Only fields provided in the request are updated; others remain unchanged.
     */
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update fields if they are present in the request
        if (request.getName() != null) user.setName(request.getName());
        if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getNationality() != null) user.setNationality(request.getNationality());

        return userRepository.save(user);
    }

    /**
     * Changes a user's password after verifying their current password.
     * Uses the provided PasswordEncoder for secure comparison and encryption.
     */
    public void changePassword(Long userId, UpdatePasswordRequest request, PasswordEncoder passwordEncoder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Security check: Validate the user's current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Encode and save the new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Retrieves the full profile details for a specific user.
     */
    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
