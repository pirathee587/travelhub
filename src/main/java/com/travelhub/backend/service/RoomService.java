package com.travelhub.backend.service;

import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.service.ImageUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    public Room addRoom(String name, String type, double price, String description, MultipartFile image, boolean availability) {
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

        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(String id) {
        Optional<Room> room = roomRepository.findById(id);
        return room.orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public List<Room> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public Room updateRoom(String id, String name, String type, Double price, String description, MultipartFile image) {
        Room room = getRoomById(id);
        room.setName(name);
        room.setType(type);
        room.setPrice(price);
        room.setDescription(description);

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

    public Room updateRoomAvailability(String id, boolean availability) {
        Room room = getRoomById(id);
        room.setAvailability(availability);
        return roomRepository.save(room);
    }
}