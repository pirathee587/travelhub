package com.travelhub.backend.repository;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository
        extends JpaRepository<User, Long> {

    // ── Existing ─────────────────────────────────────
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // ── Admin-க்கு சேர்க்கணும் ──────────────────────
    List<User> findByRole(Role role);

    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email);

    List<User> findByRoleAndAgentApprovedFalse(Role role);

    Long countByRole(Role role);
}