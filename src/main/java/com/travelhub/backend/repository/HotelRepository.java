package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository
        extends JpaRepository<Hotel, Long> {

    // ── Existing ──────────────────────────────────────
    List<Hotel> findByDestinationIgnoreCase(
            String destination);

    List<Hotel> findByDistrictIgnoreCase(String district);

    // Pending, Approved, Rejected Hotel
    List<Hotel> findByApplicationStatus(String applicationStatus);

    long countByApplicationStatus(String applicationStatus);

    // Approved hotels filtered by district
    List<Hotel> findByApplicationStatusAndDistrictIgnoreCase(
            String applicationStatus, String district);

    // ── Owner Specific ────────────────────────────────
    List<Hotel> findByOwnerIdAndApplicationStatus(
            Long ownerId, String status);

    // Find pending hotels by ownerEmail stored in hotel row (works even when owner_id is NULL)
    List<Hotel> findByOwnerEmailIgnoreCaseAndApplicationStatus(
            String ownerEmail, String status);
}
