package com.travelhub.backend.repository;

import com.travelhub.backend.entity.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelImageRepository extends JpaRepository<HotelImage, Long> {

    // ── All images for a hotel ordered by display_order ────────────────────────
    @Query("""
        SELECT hi FROM HotelImage hi
        WHERE hi.hotel.id = :hotelId
        ORDER BY hi.displayOrder ASC, hi.id ASC
        """)
    List<HotelImage> findByHotelIdOrdered(@Param("hotelId") Long hotelId);

    // ── First image for a single hotel ─────────────────────────────────────────
    @Query("""
        SELECT hi.imageUrl FROM HotelImage hi
        WHERE hi.hotel.id = :hotelId
        ORDER BY hi.displayOrder ASC, hi.id ASC
        LIMIT 1
        """)
    Optional<String> findFirstImageUrlByHotelId(@Param("hotelId") Long hotelId);

    // ── Batch: first image URL per hotel ───────────────────────────────────────
    // Returns [hotel_id, image_url] — one row per hotel (lowest displayOrder / id)
    @Query("""
        SELECT hi.hotel.id, hi.imageUrl
        FROM HotelImage hi
        WHERE hi.hotel.id IN :hotelIds
        ORDER BY hi.hotel.id ASC, hi.displayOrder ASC, hi.id ASC
        """)
    List<Object[]> findFirstImageUrlsByHotelIds(@Param("hotelIds") List<Long> hotelIds);
}
