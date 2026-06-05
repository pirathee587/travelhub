package com.travelhub.backend.service;

import com.travelhub.backend.common.ForbiddenException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.OwnerSessionResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OwnerAccessService {

    private final UserRepository userRepository;

    public OwnerSessionResponse getSession(Long ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId.toString()));

        boolean isHotelOwner = user.getRole() == Role.HOTEL_OWNER;
        boolean isApproved = isApprovedStatus(user.getStatus());
        boolean isActive = user.getIsActive() == null || Boolean.TRUE.equals(user.getIsActive());
        boolean accessGranted = isHotelOwner && isApproved && isActive;

        String message = buildAccessMessage(isHotelOwner, isApproved, isActive);

        return OwnerSessionResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus())
                .isActive(user.getIsActive())
                .isApproved(isApproved)
                .accessGranted(accessGranted)
                .message(message)
                .build();
    }

    public User validateApprovedActiveHotelOwner(Long ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", ownerId.toString()));

        if (user.getRole() != Role.HOTEL_OWNER) {
            throw new ForbiddenException("Access denied: user is not a hotel owner.");
        }

        if (!isApprovedStatus(user.getStatus())) {
            throw new ForbiddenException(
                    "Access denied: account is not approved. Current status: " + user.getStatus());
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new ForbiddenException("Access denied: account is marked as inactive.");
        }

        return user;
    }

    private String buildAccessMessage(boolean isHotelOwner, boolean isApproved, boolean isActive) {
        if (!isHotelOwner) {
            return "Access denied: user does not have the hotel owner role.";
        }
        if (!isApproved) {
            return "Access denied: account approval is pending (status must be Approved or ACTIVE).";
        }
        if (!isActive) {
            return "Access denied: account is marked as inactive.";
        }
        return "Access granted.";
    }

    /** users.status — ACTIVE (backend enum) or Approved (manual Supabase value) */
    private boolean isApprovedStatus(String status) {
        if (status == null) return false;
        return "ACTIVE".equalsIgnoreCase(status) || "Approved".equalsIgnoreCase(status);
    }
}
