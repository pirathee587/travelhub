package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // Approved hotels filtered by district
    List<Hotel> findByApplicationStatusAndDistrictIgnoreCase(
            String applicationStatus, String district);

    // ── Owner Specific ────────────────────────────────
    List<Hotel> findByOwnerId(Long ownerId);

    List<Hotel> findByOwnerIdAndApplicationStatus(
            Long ownerId, String status);

    // Find pending hotels by ownerEmail stored in hotel row (works even when owner_id is NULL)
    List<Hotel> findByOwnerEmailIgnoreCaseAndApplicationStatus(
            String ownerEmail, String status);

    long countByOwnerIdAndApplicationStatus(Long ownerId, String applicationStatus);

    // Fetch all image URLs for a hotel from the hotel_images table
    @Query(value = "SELECT image_url FROM hotel_images WHERE hotel_id = :hotelId ORDER BY display_order ASC NULLS LAST", nativeQuery = true)
    List<String> findImageUrlsByHotelId(@Param("hotelId") Long hotelId);
}
