package com.travelhub.backend.controller;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.service.HotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * HotelController manages the public-facing hotel discovery and search endpoints.
 * It provides tools for tourists to browse accommodations based on geographical location and specific property identifiers.
 */
@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    /**
     * Constructor injection for public hotel discovery business logic.
     */
    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    /**
     * Retrieves a list of available hotels across the platform.
     * Supports optional geographical filtering by 'destination' or 'district'.
     * If no filters are provided (or set to 'all'), returns the full inventory of approved hotels.
     */
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

    /**
     * Retrieves comprehensive information for a single hotel property by its ID.
     * Includes metadata for amenities, locations, and contact details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }
}
