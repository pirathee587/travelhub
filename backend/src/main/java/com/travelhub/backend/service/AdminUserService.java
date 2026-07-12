package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminUserResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository         userRepository;
    private final ApplicationEventPublisher eventPublisher; // ← சேர்க்கணும்

    // ── Get All Users ─────────────────────────────────
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Users By Role ─────────────────────────────
    public List<AdminUserResponse> getUsersByRole(
            String role) {
        Role roleEnum = Role.valueOf(role.toUpperCase());
        return userRepository.findByRole(roleEnum)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get User By ID ────────────────────────────────
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User", "id", id));
        return mapToResponse(user);
    }

    // ── Search Users ──────────────────────────────────
    public List<AdminUserResponse> searchUsers(
            String keyword) {
        return userRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        keyword, keyword)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Pending Agents ────────────────────────────
    public List<AdminUserResponse> getPendingAgents() {
        return userRepository
                .findByRoleAndAgentApprovedFalse(Role.AGENT)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Toggle User Active/Block ──────────────────────
    @Transactional
    public AdminUserResponse toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User", "id", id));

        if (user.getRole() == Role.ADMIN)
            throw new BadRequestException(
                    "Cannot deactivate Admin accounts");

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);

        // ✅ Block → REJECTED event
        // ✅ Unblock → APPROVED event
        if (!user.getIsActive()) {
            eventPublisher.publishEvent(
                    new UserAccountEvent(
                            this, user, "REJECTED",
                            "Account deactivated by admin"));
        } else {
            eventPublisher.publishEvent(
                    new UserAccountEvent(
                            this, user, "APPROVED"));
        }

        return mapToResponse(user);
    }

    // ── Approve Agent ─────────────────────────────────
    @Transactional
    public AdminUserResponse approveAgent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User", "id", id));

        if (user.getRole() != Role.AGENT)
            throw new BadRequestException(
                    "User is not an Agent");

        user.setAgentApproved(true);
        userRepository.save(user);


        eventPublisher.publishEvent(
                new UserAccountEvent(
                        this, user, "APPROVED"));

        return mapToResponse(user);
    }

    // ── Reject Agent ──────────────────────────────────
    @Transactional
    public AdminUserResponse rejectAgent(
            Long id, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User", "id", id));

        if (user.getRole() != Role.AGENT)
            throw new BadRequestException(
                    "User is not an Agent");

        user.setAgentApproved(false);
        userRepository.save(user);


        eventPublisher.publishEvent(
                new UserAccountEvent(
                        this, user, "REJECTED", reason));

        return mapToResponse(user);
    }

    // ── Delete User ───────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User", "id", id));

        if (user.getRole() == Role.ADMIN)
            throw new BadRequestException(
                    "Cannot delete Admin accounts");

        userRepository.delete(user);
    }

    // ── Map Entity to Response ────────────────────────
    private AdminUserResponse mapToResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getTelephone(),
                user.getIsActive(),
                user.getAgentApproved(),
                user.getCreatedAt() != null
                        ? user.getCreatedAt().toString()
                        : ""
        );
    }
}