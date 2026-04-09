package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByHotelId(Long hotelId);

    List<Room> findByHotelIdAndNameContainingIgnoreCase(Long hotelId, String name);

    @Query("SELECT DISTINCT r.type FROM Room r WHERE r.hotel.id = :hotelId")
    List<String> findDistinctRoomTypesByHotelId(@Param("hotelId") Long hotelId);
}