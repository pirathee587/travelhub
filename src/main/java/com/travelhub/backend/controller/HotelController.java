package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getAllHotels(
            @RequestParam(required = false) String destination) {
        if (destination != null && !destination.equals("all")) {
            return ResponseEntity.ok(hotelService.getHotelsByDestination(destination));
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    // ── Chatbot endpoint ───────────────────────────────────────────────────
    // GET /api/hotels/chatbot-data
    // Called by Python AI service on startup and every 30 min to sync ChromaDB
    @GetMapping("/chatbot-data")
    public ResponseEntity<List<Map<String, Object>>> getHotelsForChatbot() {
    return ResponseEntity.ok(hotelService.getAllHotelsForChatbot());
    }
}
 