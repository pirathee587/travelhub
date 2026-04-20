package com.travelhub.backend.repository;

import com.travelhub.backend.entity.AgentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AgentSettingsRepository extends JpaRepository<AgentSettings, Long> {
    Optional<AgentSettings> findByAgentId(Long agentId);
}