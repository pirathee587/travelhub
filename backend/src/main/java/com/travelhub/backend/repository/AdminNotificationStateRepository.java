package com.travelhub.backend.repository;

import com.travelhub.backend.entity.AdminNotificationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface AdminNotificationStateRepository extends JpaRepository<AdminNotificationState, Long> {

    @Query("SELECT s.notifId FROM AdminNotificationState s WHERE s.adminId = :adminId AND s.state = :state")
    Set<Long> findNotifIdsByAdminIdAndState(@Param("adminId") Long adminId, @Param("state") String state);

    boolean existsByAdminIdAndNotifIdAndState(Long adminId, Long notifId, String state);
}
