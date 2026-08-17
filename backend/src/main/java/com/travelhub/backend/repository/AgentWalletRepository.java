package com.travelhub.backend.repository;

import com.travelhub.backend.entity.AgentWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AgentWalletRepository extends JpaRepository<AgentWallet, Long> {
    Optional<AgentWallet> findByAgentId(Long agentId);
}
