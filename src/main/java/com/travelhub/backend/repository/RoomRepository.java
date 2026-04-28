package com.travelhub.backend.repository;

import com.travelhub.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository
        extends JpaRepository<Room, String> {

    // Hotel-இன் எல்லா rooms
    List<Room> findByHotelId(Long hotelId);
}