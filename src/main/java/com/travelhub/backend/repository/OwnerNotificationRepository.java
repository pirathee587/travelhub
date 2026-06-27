package com.travelhub.backend.repository;

import com.travelhub.backend.entity.OwnerNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnerNotificationRepository extends JpaRepository<OwnerNotification, Long> {

    List<OwnerNotification> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<OwnerNotification> findByOwnerIdAndIsRead(Long ownerId, Boolean isRead);

    long countByOwnerIdAndIsReadFalse(Long ownerId);

    @Modifying
    @Query("UPDATE OwnerNotification n SET n.isRead = true WHERE n.ownerId = :ownerId AND n.isRead = false")
    void markAllReadByOwnerId(Long ownerId);
}
