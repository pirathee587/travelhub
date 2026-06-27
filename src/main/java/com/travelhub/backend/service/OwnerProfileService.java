package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class OwnerProfileService {

    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;

    public OwnerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        return toResponse(user);
    }

    public OwnerProfileResponse updateProfile(Long userId, OwnerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getTelephone() != null) user.setTelephone(request.getTelephone());
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getBusinessAddress() != null) user.setBusinessAddress(request.getBusinessAddress());
        if (request.getDistrict() != null) user.setDistrict(request.getDistrict());
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getTelephone() != null) {
            user.setTelephone(request.getTelephone());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getPreferredLanguage() != null) {
            user.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getBusinessAddress() != null) {
            user.setBusinessAddress(request.getBusinessAddress());
        }
        if (request.getDistrict() != null) {
            user.setDistrict(request.getDistrict());
        }

        user = userRepository.save(user);

        return toResponse(user);
    }

    public OwnerProfileResponse uploadProfileImage(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        String imageUrl = imageUploadService.uploadProfileImage(file).getImageUrl();
        user.setProfileImage(imageUrl);
        user = userRepository.save(user);

        return toResponse(user);
    }

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
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
