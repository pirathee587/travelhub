package com.travelhub.backend.repository;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Standard Authentication methods
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // Admin & Management methods
    List<User> findByRole(Role role);

    // Search functionality for user management dashboard
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    // Filter for agents awaiting verification
    List<User> findByRoleAndAgentApprovedFalse(Role role);

    // Statistics for admin dashboard
    Long countByRole(Role role);
}