package com.travelhub.backend.repository;

import com.travelhub.backend.entity.AgentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * AgentSettingsRepository provides data access methods for agent-specific configurations.
 * It manages the persistent preferences and notification toggles for agents.
 */
@Repository
public interface AgentSettingsRepository extends JpaRepository<AgentSettings, Long> {
    
    // Retrieves the single configuration profile associated with a specific agent ID
    Optional<AgentSettings> findByAgentId(Long agentId);
}