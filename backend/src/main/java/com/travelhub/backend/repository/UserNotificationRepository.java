package com.travelhub.backend.repository;

import com.travelhub.backend.entity.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<UserNotification> findByUserIdAndReadOrderByCreatedAtDesc(Long userId, Boolean read);
    long countByUserIdAndReadFalse(Long userId);
}
