package com.travelhub.backend.controller;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.event.UserAccountEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * NotificationDemoController provides manual triggers for testing the system's asynchronous notification workflows.
 * It is primarily used during development and QA to verify that emails and system alerts are correctly dispatched upon account status changes.
 */
@RestController
@RequestMapping("/api/demo/notifications")
public class NotificationDemoController {

    private final ApplicationEventPublisher eventPublisher;

    /**
     * Constructor injection for Spring's internal event publishing mechanism.
     */
    public NotificationDemoController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    /**
     * Manually triggers an 'APPROVED' account event for a simulated agent.
     * Use this to verify that the agent receives their activation email.
     */
    @GetMapping("/agent-approve")
    public String demoAgentApprove(@RequestParam String email) {
        User mockUser = new User();
        mockUser.setName("Demo Agent");
        mockUser.setEmail(email);
        mockUser.setRole(Role.AGENT);
        
        // Publish internal event to be picked up by EventListeners (e.g., in AccountNotificationListener)
        eventPublisher.publishEvent(new UserAccountEvent(this, mockUser, "APPROVED"));
        return "Notification Event 'AGENT_APPROVED' published for: " + email;
    }

    /**
     * Manually triggers a 'REJECTED' account event for a simulated agent with a specified reason.
     * Use this to verify the rejection notification workflow.
     */
    @GetMapping("/agent-reject")
    public String demoAgentReject(@RequestParam String email, @RequestParam(defaultValue = "Documents missing") String reason) {
        User mockUser = new User();
        mockUser.setName("Demo Agent");
        mockUser.setEmail(email);
        mockUser.setRole(Role.AGENT);
        
        eventPublisher.publishEvent(new UserAccountEvent(this, mockUser, "REJECTED", reason));
        return "Notification Event 'AGENT_REJECTED' published for: " + email + " with reason: " + reason;
    }
}
