package com.travelhub.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.RoomRepository;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    public Room addRoom(String name, String type, double price, String description, MultipartFile image, boolean availability, Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + hotelId));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = imageUploadService.uploadRoomImage(image).getImageUrl();
        }

        Room room = new Room();
        room.setId(UUID.randomUUID().toString());
        room.setName(name);
        room.setType(type);
        room.setPrice(price);
        room.setDescription(description);
        room.setImageUrl(imageUrl);
        room.setAvailability(availability);
        room.setHotel(hotel);

        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public Room getRoomById(String id) {
        Optional<Room> room = roomRepository.findById(id);
        return room.orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Room updateRoomAvailability(String id, boolean availability) {
        Room room = getRoomById(id);
        room.setAvailability(availability);
        return roomRepository.save(room);
    }

    public Room updateRoom(String id, String name, String type, double price, String description, MultipartFile image, boolean availability) {
        Room room = getRoomById(id);
        room.setName(name);
        room.setType(type);
        room.setPrice(price);
        room.setDescription(description);
        room.setAvailability(availability);
        
        if (image != null && !image.isEmpty()) {
            String imageUrl = imageUploadService.uploadRoomImage(image).getImageUrl();
            room.setImageUrl(imageUrl);
        }
        
        return roomRepository.save(room);
    }

    public void deleteRoom(String id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
    }
}