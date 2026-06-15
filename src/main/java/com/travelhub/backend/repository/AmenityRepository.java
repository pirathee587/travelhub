package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * AmenityRepository provides data access methods for hotel amenities.
 * It primarily handles retrieving features and services associated with specific hotels.
 */
@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    // Retrieves all amenities (e.g., Wi-Fi, Pool, Gym) linked to a specific hotel ID
    List<Amenity> findByHotelId(Long hotelId);
}
