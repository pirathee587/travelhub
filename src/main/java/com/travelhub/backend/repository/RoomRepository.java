package com.travelhub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelhub.backend.entity.Room;

/**
 * RoomRepository handles database operations for hotel rooms.
 * It includes specialized queries for fetching rooms by hotel and calculating pricing ranges.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, String> {

    // Retrieves all rooms belonging to a specific hotel, using JOIN FETCH to optimize performance
    @Query("SELECT r FROM Room r JOIN FETCH r.hotel h WHERE h.id = :hotelId")
    List<Room> findByHotelId(@Param("hotelId") Long hotelId);

    // Calculates the minimum and maximum room prices for a list of hotels.
    // Returns a list of object arrays containing [hotelId, minPrice, maxPrice].
    @Query("""
        SELECT r.hotel.id,
           MIN(CASE WHEN r.price > 0 THEN r.price ELSE NULL END),
           MAX(CASE WHEN r.price > 0 THEN r.price ELSE NULL END)
        FROM Room r
        WHERE r.hotel.id IN :hotelIds
        GROUP BY r.hotel.id
        """)
    List<Object[]> findPriceRangesByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

    // Calculates the minimum and maximum room prices for a single specific hotel.
    // Returns [hotelId, minPrice, maxPrice] in an object array.
    @Query("""
        SELECT r.hotel.id,
           MIN(CASE WHEN r.price > 0 THEN r.price ELSE NULL END),
           MAX(CASE WHEN r.price > 0 THEN r.price ELSE NULL END)
        FROM Room r
        WHERE r.hotel.id = :hotelId
        GROUP BY r.hotel.id
        """)
    List<Object[]> findPriceRangeByHotelIdRaw(@Param("hotelId") Long hotelId);
}