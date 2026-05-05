package com.travelhub.backend.controller;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.event.UserAccountEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo/notifications")
public class NotificationDemoController {

    private final ApplicationEventPublisher eventPublisher;

    public NotificationDemoController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/agent-approve")
    public String demoAgentApprove(@RequestParam String email) {
        User mockUser = new User();
        mockUser.setName("Demo Agent");
        mockUser.setEmail(email);
        mockUser.setRole(Role.AGENT);
        
        eventPublisher.publishEvent(new UserAccountEvent(this, mockUser, "APPROVED"));
        return "Notification Event 'AGENT_APPROVED' published for: " + email;
    }

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
