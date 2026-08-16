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

    Optional<PackageReport> findByUserIdAndBookingId(Long userId, Long bookingId);

    List<PackageReport> findAllByOrderByCreatedAtDesc();

    boolean existsByUserIdAndBookingIdAndStatusIn(Long userId, Long bookingId, List<String> statuses);
}
