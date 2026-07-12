package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.AgentDetailResponse;
import com.travelhub.backend.dto.response.AgentListResponse;
import com.travelhub.backend.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    /** GET /api/agents — returns all approved agents */
    @GetMapping
    public ResponseEntity<List<AgentListResponse>> getAllAgents() {
        return ResponseEntity.ok(agentService.getApprovedAgents());
    }

    /** GET /api/agents/{id} — returns agent profile with their packages */
    @GetMapping("/{id}")
    public ResponseEntity<AgentDetailResponse> getAgentById(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }
}
