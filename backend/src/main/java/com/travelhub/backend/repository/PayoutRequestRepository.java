package com.travelhub.backend.repository;

import com.travelhub.backend.entity.PayoutRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {
    List<PayoutRequest> findByAgentIdOrderByCreatedAtDesc(Long agentId);
    List<PayoutRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<PayoutRequest> findAllByOrderByCreatedAtDesc();
}
