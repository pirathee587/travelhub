package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * OwnerProfileService manages the personal and business account details for hotel owners.
 * It provides methods for profile retrieval, text-based updates, and multimedia profile image handling.
 */
@Service
public class OwnerProfileService {

    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;

    /**
     * Constructor injection for user data access and image processing services.
     */
    public OwnerProfileService(UserRepository userRepository, ImageUploadService imageUploadService) {
        this.userRepository = userRepository;
        this.imageUploadService = imageUploadService;
    }

    /**
     * Retrieves the current profile information for a specific hotel owner.
     */
    public OwnerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        return toResponse(user);
    }

    /**
     * Updates an owner's profile information.
     * Synchronizes personal details, preferences, and business location data.
     */
    public OwnerProfileResponse updateProfile(Long userId, OwnerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        // Synchronize fields from the request DTO
        user.setName(request.getName());
        user.setTelephone(request.getTelephone());
        user.setProfileImage(request.getProfileImage());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setBusinessAddress(request.getBusinessAddress());
        user.setDistrict(request.getDistrict());

        user = userRepository.save(user);

        return toResponse(user);
    }

    /**
     * Specifically handles the asynchronous upload and update of the owner's profile image.
     */
    public OwnerProfileResponse uploadProfileImage(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        // Delegate to multimedia service and persist the resulting URL
        String imageUrl = imageUploadService.uploadProfileImage(file).getImageUrl();
        user.setProfileImage(imageUrl);
        user = userRepository.save(user);

        return toResponse(user);
    }

    /**
     * Maps a User entity to a clean OwnerProfileResponse DTO.
     * Extracts relevant account metadata including status and business identifiers.
     */
    private OwnerProfileResponse toResponse(User user) {
        return OwnerProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .profileImage(user.getProfileImage())
                .preferredLanguage(user.getPreferredLanguage())
                .businessAddress(user.getBusinessAddress())
                .district(user.getDistrict())
                .businessRegistrationId(user.getBusinessRegistrationId())
                .status(user.getStatus())
                .build();
    }
}
