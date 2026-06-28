package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAllHotels(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String district) {
        if (destination != null && !destination.equals("all")) {
            return ResponseEntity.ok(hotelService.getHotelsByDestination(destination));
        }
        if (district != null && !district.equals("all")) {
            return ResponseEntity.ok(hotelService.getHotelsByDistrict(district));
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/chatbot-data")
    public ResponseEntity<List<HotelResponse>> getChatbotData() {
        // Always returns the latest approved hotels directly from the database.
        // Called by the Python chatbot service on every chat request — no caching.
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }
}
