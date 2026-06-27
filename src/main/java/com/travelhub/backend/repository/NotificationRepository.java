package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAgentIdOrderByCreatedAtDesc(Long agentId);
    List<Notification> findByAgentIdAndRead(Long agentId, Boolean read);

    // ── Admin queries (all agents) ─────────────────────
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByReadFalseOrderByCreatedAtDesc();
    long countByReadFalse();
    List<Notification> findTop10ByOrderByCreatedAtDesc();
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
}