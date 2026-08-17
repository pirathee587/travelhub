package com.travelhub.backend.repository;

import com.travelhub.backend.entity.AdminNotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminNotificationPreferenceRepository extends JpaRepository<AdminNotificationPreference, Long> {

    @Query("SELECT p FROM AdminNotificationPreference p WHERE p.admin.id = :adminId")
    Optional<AdminNotificationPreference> findByAdminId(@Param("adminId") Long adminId);

    boolean existsByAdminId(Long adminId);
}
