package com.travelhub.backend.repository;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ── Authentication & Security ──────────────────────────
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);
    Optional<User> findByHotelId(Long hotelId);
    Optional<User> findByAgentId(Long agentId);

    // ── Admin Management Filters ───────────────────────────

    // Returns all users with a specific role (ADMIN, AGENT, USER)
    List<User> findByRole(Role role);

    // Dynamic search: Checks if name OR email contains the keyword (case-insensitive)
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // Specifically for the agent verification workflow
    List<User> findByRoleAndAgentApprovedFalse(Role role);

    // ── Analytics & Dashboards ─────────────────────────────

    // Useful for showing "Total Agents" or "Total Travelers" on the dashboard
    Long countByRole(Role role);
}