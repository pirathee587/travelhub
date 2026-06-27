package com.travelhub.backend.repository;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    Optional<User> findByHotelId(Long hotelId);

    @Query("SELECT a.owner FROM Agent a WHERE a.id = :agentId")
    Optional<User> findByAgentId(@Param("agentId") Long agentId);

    // ── Direct update for agent suspension (bypasses entity-loading/proxy issues) ──
    @Modifying
    @Query("UPDATE User u SET u.isActive = :isActive WHERE u.id = (SELECT a.owner.id FROM Agent a WHERE a.id = :agentId)")
    int updateIsActiveByAgentId(@Param("agentId") Long agentId, @Param("isActive") Boolean isActive);

    // ── Direct update for hotel owner suspension ────────────────────────────────
    @Modifying
    @Query("UPDATE User u SET u.isActive = :isActive WHERE u.hotelId = :hotelId")
    int updateIsActiveByHotelId(@Param("hotelId") Long hotelId, @Param("isActive") Boolean isActive);
}