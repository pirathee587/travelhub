package com.travelhub.backend.service;

import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * RoomService manages the business logic for hotel room operations.
 * This includes adding, updating, and deleting rooms, as well as managing their availability and images.
 */
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ImageUploadService imageUploadService;

    /**
     * Constructor injection for repositories and multimedia services.
     */
    public RoomService(RoomRepository roomRepository, ImageUploadService imageUploadService) {
        this.roomRepository = roomRepository;
        this.imageUploadService = imageUploadService;
    }

    /**
     * Adds a new room to the system.
     * Handles image upload and generates a unique string-based UUID for the room ID.
     */
    public Room addRoom(String name, String type, double price, String description, MultipartFile image, boolean availability) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = imageUploadService.uploadRoomImage(image).getImageUrl();
        }

        Room room = new Room();
        // Generate unique identifier
        room.setId(UUID.randomUUID().toString());
        room.setName(name);
        room.setType(type);
        room.setPrice(price);
        room.setDescription(description);
        room.setImageUrl(imageUrl);
        room.setAvailability(availability);

        return roomRepository.save(room);
    }

    /**
     * Retrieves all rooms currently registered in the system.
     */
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    /**
     * Retrieves a single room by its unique ID.
     */
    public Room getRoomById(String id) {
        Optional<Room> room = roomRepository.findById(id);
        return room.orElseThrow(() -> new RuntimeException("Room not found"));
    }

    /**
     * Retrieves all rooms associated with a specific hotel.
     */
    public List<Room> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    /**
     * Updates an existing room's details.
     * If a new image is provided, it replaces the existing one.
     */
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

    /**
     * Deletes a room from the system using its ID.
     */
    public void deleteRoom(String id) {
        Room room = getRoomById(id);
        roomRepository.delete(room);
    }

    /**
     * Toggles the real-time availability status of a room.
     */
    public Room updateRoomAvailability(String id, boolean availability) {
        Room room = getRoomById(id);
        room.setAvailability(availability);
        return roomRepository.save(room);
    }
}