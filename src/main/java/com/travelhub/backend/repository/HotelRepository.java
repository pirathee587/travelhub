package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * HotelRepository provides data access methods for the Hotel entity.
 * It supports searching by location, application status, and owner credentials.
 */
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // ── Location Based Searches ──────────────────────────
    
    // Retrieves all hotels in a specific destination (e.g., "Colombo"), case-insensitive
    List<Hotel> findByDestinationIgnoreCase(String destination);

    // Retrieves all hotels within a specific administrative district, case-insensitive
    List<Hotel> findByDistrictIgnoreCase(String district);

    // ── Application Status Filters ───────────────────────
    
    // Retrieves hotels based on their registration status (e.g., "Pending", "Approved")
    List<Hotel> findByApplicationStatus(String applicationStatus);

    // Retrieves approved hotels within a specific district, ensuring only valid options are returned
    List<Hotel> findByApplicationStatusAndDistrictIgnoreCase(
            String applicationStatus, String district);

    // ── Owner Specific Queries ────────────────────────────
    
    // Retrieves hotels owned by a specific User ID, filtered by their status
    List<Hotel> findByOwnerIdAndApplicationStatus(Long ownerId, String status);

    // Fallback: Finds hotels by the owner's email address and status.
    // Useful for legacy data or when the direct User link might be missing.
    List<Hotel> findByOwnerEmailIgnoreCaseAndApplicationStatus(
            String ownerEmail, String status);
}
