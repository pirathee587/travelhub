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

    long countByOwnerIdAndApplicationStatus(Long ownerId, String applicationStatus);
    // ── Hotel search for package creation (autocomplete) ─────
    @org.springframework.data.jpa.repository.Query(
        "SELECT h FROM Hotel h WHERE h.applicationStatus = 'Approved' " +
        "AND LOWER(h.hotelName) LIKE LOWER(CONCAT('%', :query, '%')) " +
        "AND (:district IS NULL OR LOWER(h.district) = LOWER(cast(:district as string)))")
    List<Hotel> searchByNameAndDistrict(
        @org.springframework.data.repository.query.Param("query") String query,
        @org.springframework.data.repository.query.Param("district") String district);

    List<Hotel> findTop5ByOrderByIdDesc();
}
