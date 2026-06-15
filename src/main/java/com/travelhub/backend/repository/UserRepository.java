package com.travelhub.backend.repository;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository provides data access methods for the User entity.
 * It includes methods for authentication, account verification, and administrative management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ── Authentication & Security ──────────────────────────
    
    // Finds a user by their unique email address
    Optional<User> findByEmail(String email);

    // Checks if a user with the given email already exists in the system
    Boolean existsByEmail(String email);
    
    // Finds a user using their email verification token
    Optional<User> findByVerificationToken(String token);
    
    // Finds a user using their password reset token
    Optional<User> findByPasswordResetToken(String token);

    // ── Admin Management Filters ───────────────────────────

    // Retrieves all users who have been assigned a specific role
    List<User> findByRole(Role role);

    // Performs a case-insensitive search for users by matching a keyword against their name or email
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // Retrieves users of a specific role who have not yet been approved (specifically for Agents)
    List<User> findByRoleAndAgentApprovedFalse(Role role);

    // ── Analytics & Dashboards ─────────────────────────────

    // Counts the total number of users belonging to a specific role
    Long countByRole(Role role);
}