package com.travelhub.backend.controller;

import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TestController {
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;

    @GetMapping("/api/v1/test/create-agent")
    public String createTestAgent() {
        User user = User.builder()
                .name("Test User")
                .email("testagent_" + System.currentTimeMillis() + "@example.com")
                .password("testpass")
                .telephone("1234567890")
                .role(Role.AGENT)
                .isEmailVerified(true)
                .status("ACTIVE")
                .isActive(true)
                .agentApproved(true)
                .build();

        user = userRepository.save(user);

        Agent agent = Agent.builder()
                .owner(user)
                .agencyName("Test Agency")
                .isActive(true)
                .build();

        agent = agentRepository.save(agent);

        return "Created User ID: " + user.getId() + ", Created Agent ID: " + agent.getId();
    }
}
