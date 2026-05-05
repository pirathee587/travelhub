package com.travelhub.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.travelhub.backend.dto.response.RoomResponse;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.service.RoomService;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Room>> getRoomsByHotelId(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(hotelId));
    }

    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestParam String name,
                                        @RequestParam String type,
                                        @RequestParam double price,
                                        @RequestParam(required = false) String description,
                                        @RequestParam(required = false) MultipartFile image,
                                        @RequestParam(defaultValue = "true") boolean availability,
                                        @RequestParam Long hotelId) {
        Room room = roomService.addRoom(name, type, price, description, image, availability, hotelId);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable String id,
                                           @RequestParam String name,
                                           @RequestParam String type,
                                           @RequestParam Double price,
                                           @RequestParam(required = false) String description,
                                           @RequestParam(required = false) MultipartFile image) {
        Room room = roomService.updateRoom(id, name, type, price, description, image);
        return ResponseEntity.ok(room);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Room> updateRoomAvailability(@PathVariable String id, @RequestParam boolean availability) {
        return ResponseEntity.ok(roomService.updateRoomAvailability(id, availability));
    }
}