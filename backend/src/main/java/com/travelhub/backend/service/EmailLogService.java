package com.travelhub.backend.service;

import com.travelhub.backend.entity.EmailLog;
import com.travelhub.backend.repository.EmailLogRepository;
import org.springframework.stereotype.Service;

@Service
public class EmailLogService {

    private final EmailLogRepository emailLogRepository;

    public EmailLogService(EmailLogRepository emailLogRepository) {
        this.emailLogRepository = emailLogRepository;
    }

    public void logSent(String recipient, String subject, String content, String relatedType, Long relatedId) {
        EmailLog log = new EmailLog();
        log.setRecipientEmail(recipient);
        log.setSubject(subject);
        log.setContent(content);
        log.setStatus("SENT");
        log.setRelatedType(relatedType);
        log.setRelatedId(relatedId);
        emailLogRepository.save(log);
    }

    public void logFailed(String recipient, String subject, String content, String relatedType, Long relatedId, String error) {
        EmailLog log = new EmailLog();
        log.setRecipientEmail(recipient);
        log.setSubject(subject);
        log.setContent(content);
        log.setStatus("FAILED");
        log.setRelatedType(relatedType);
        log.setRelatedId(relatedId);
        log.setErrorMessage(error);
        emailLogRepository.save(log);
    }
}
