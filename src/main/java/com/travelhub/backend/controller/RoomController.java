package com.travelhub.backend.controller;

import com.travelhub.backend.entity.Room;
import com.travelhub.backend.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public ResponseEntity<Room> addRoom(@RequestParam String name,
                                        @RequestParam String type,
                                        @RequestParam double price,
                                        @RequestParam(required = false) String description,
                                        @RequestParam(required = false) MultipartFile image,
                                        @RequestParam Long hotelId) {
        Room room = roomService.addRoom(name, type, price, description, image, hotelId);
        return ResponseEntity.ok(room);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Room>> getRoomsByHotelId(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getRoomsByHotelId(hotelId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Room>> searchRoomsByName(@RequestParam Long hotelId, @RequestParam String query) {
        return ResponseEntity.ok(roomService.searchRooms(hotelId, query));
    }

    @GetMapping("/hotel/{hotelId}/types")
    public ResponseEntity<List<String>> getDistinctRoomTypes(@PathVariable Long hotelId) {
        return ResponseEntity.ok(roomService.getDistinctRoomTypes(hotelId));
    }
}