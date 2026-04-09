package com.travelhub.backend.service;

import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.RoomRepository;
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
    private HotelRepository hotelRepository;

    @Autowired
    private ImageUploadService imageUploadService;

    public Room addRoom(String name, String type, double price, String description, MultipartFile image, Long hotelId) {
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

    public List<Room> searchRooms(Long hotelId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getRoomsByHotelId(hotelId);
        }
        return roomRepository.findByHotelIdAndNameContainingIgnoreCase(hotelId, query.trim());
    }

    public List<String> getDistinctRoomTypes(Long hotelId) {
        return roomRepository.findDistinctRoomTypesByHotelId(hotelId);
    }
}