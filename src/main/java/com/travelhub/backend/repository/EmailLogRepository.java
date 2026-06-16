package com.travelhub.backend.repository;

import com.travelhub.backend.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<EmailLog> findAllByOrderByCreatedAtDesc();
}
