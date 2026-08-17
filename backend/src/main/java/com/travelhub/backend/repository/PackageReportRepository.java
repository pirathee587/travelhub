package com.travelhub.backend.repository;

import com.travelhub.backend.entity.PackageReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageReportRepository extends JpaRepository<PackageReport, Long> {

    List<PackageReport> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PackageReport> findByBookingId(Long bookingId);

    @org.springframework.data.jpa.repository.Query("SELECT pr FROM PackageReport pr WHERE pr.agent.id = :agentId")
    List<PackageReport> findByAgentId(@org.springframework.data.repository.query.Param("agentId") Long agentId);

    @org.springframework.data.jpa.repository.Query("SELECT pr FROM PackageReport pr WHERE pr.pkg.id = :pkgId")
    List<PackageReport> findByPkgId(@org.springframework.data.repository.query.Param("pkgId") Long pkgId);

    Optional<PackageReport> findByUserIdAndBookingId(Long userId, Long bookingId);

    List<PackageReport> findAllByOrderByCreatedAtDesc();

    List<PackageReport> findTop10ByStatusOrderByCreatedAtDesc(String status);

    List<PackageReport> findTop10ByStatusInOrderByCreatedAtDesc(List<String> statuses);

    boolean existsByUserIdAndBookingIdAndStatusIn(Long userId, Long bookingId, List<String> statuses);
}
