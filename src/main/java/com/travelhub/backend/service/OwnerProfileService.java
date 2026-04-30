package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerProfileRequest;
import com.travelhub.backend.dto.response.OwnerProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OwnerProfileService {

    private final UserRepository userRepository;

    public OwnerProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        return toResponse(user);
    }

    public OwnerProfileResponse updateProfile(Long userId, OwnerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + userId));

        user.setName(request.getName());
        user.setTelephone(request.getTelephone());
        user.setProfileImage(request.getProfileImage());
        user.setPreferredLanguage(request.getPreferredLanguage());
        user.setBusinessAddress(request.getBusinessAddress());
        user.setDistrict(request.getDistrict());

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
                .build();
    }
}
