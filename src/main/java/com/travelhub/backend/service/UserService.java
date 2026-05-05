package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service

public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getNationality() != null) user.setNationality(request.getNationality());

        return userRepository.save(user);
    }

    public void changePassword(Long userId, UpdatePasswordRequest request, PasswordEncoder passwordEncoder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
