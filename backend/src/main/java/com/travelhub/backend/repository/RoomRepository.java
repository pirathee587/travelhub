package com.travelhub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelhub.backend.entity.Room;

@Repository
public interface RoomRepository
        extends JpaRepository<Room, String> {

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId")
    List<Room> findByHotelId(@Param("hotelId") Long hotelId);

    List<Room> findByHotel_Id(Long hotelId);

    @Query("""
        SELECT r.hotel.id,
           MIN(CASE WHEN r.price > 0 THEN r.price ELSE NULL END),
           MAX(CASE WHEN r.price > 0 THEN r.price ELSE NULL END)
        FROM Room r
        WHERE r.hotel.id IN :hotelIds
        GROUP BY r.hotel.id
        """)
    List<Object[]> findPriceRangesByHotelIdsRaw(@Param("hotelIds") List<Long> hotelIds);

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