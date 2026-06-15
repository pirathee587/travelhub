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

/**
 * RoomController manages the inventory and availability endpoints for hotel rooms.
 * It provides tools for property managers to define room types, pricing, and multimedia content.
 */
@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    /**
     * Retrieves the complete list of rooms registered under a specific hotel property.
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Room>> getRoomsByHotelId(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(hotelId));
    }

    /**
     * Endpoint for property managers to register a new room.
     * Uses @RequestParam to handle form data and optional multimedia image files.
     */
    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestParam String name,
                                        @RequestParam String type,
                                        @RequestParam double price,
                                        @RequestParam(required = false) String description,
                                        @RequestParam(required = false) MultipartFile image,
                                        @RequestParam(defaultValue = "true") boolean availability) {
        Room room = roomService.addRoom(name, type, price, description, image, availability);
        return ResponseEntity.ok(room);
    }

    /**
     * Retrieves all rooms registered across the platform (Global Inventory).
     */
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    /**
     * Retrieves detailed information for a single specific room by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    /**
     * Endpoint to update the configuration and pricing of an existing room.
     */
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

    /**
     * Endpoint to permanently remove a room from the hotel property inventory.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Specialized endpoint to quickly toggle a room's availability status (e.g., for maintenance or direct bookings).
     */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Room> updateRoomAvailability(@PathVariable String id, @RequestParam boolean availability) {
        return ResponseEntity.ok(roomService.updateRoomAvailability(id, availability));
    }
}