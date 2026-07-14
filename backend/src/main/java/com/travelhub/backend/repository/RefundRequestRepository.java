package com.travelhub.backend.repository;

import com.travelhub.backend.entity.RefundRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {
    List<RefundRequest> findByUserId(Long userId);
    List<RefundRequest> findByAgentId(Long agentId);
    Optional<RefundRequest> findByBookingId(Long bookingId);
}
