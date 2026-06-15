package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * NotificationRepository provides data access methods for system notifications.
 * It primarily handles retrieving alerts for agents, sorted by time or filtered by read status.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Retrieves all notifications for a specific agent, ordered from newest to oldest
    List<Notification> findByAgentIdOrderByCreatedAtDesc(Long agentId);
    
    // Retrieves notifications for an agent filtered by their read/unread status
    List<Notification> findByAgentIdAndRead(Long agentId, Boolean read);
}