package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.AmenityRequest;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.service.AmenityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
@CrossOrigin(origins = "*")
public class AmenityController {

    @Autowired
    private AmenityService amenityService;

    // POST /api/amenities
    @PostMapping
    public ResponseEntity<ApiResponse> addAmenity(@RequestBody AmenityRequest request) {
        Amenity amenity = amenityService.addAmenity(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Amenity added successfully", amenity));
    }

    // GET /api/amenities
    @GetMapping
    public ResponseEntity<ApiResponse> getAllAmenities() {
        List<Amenity> amenities = amenityService.getAllAmenities();
        return ResponseEntity.ok(new ApiResponse(true, "Amenities fetched successfully", amenities));
    }

    // GET /api/amenities/hotel/{hotelId} — Fetch amenities for a specific hotel
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse> getAmenitiesByHotelId(@PathVariable Long hotelId) {
        List<Amenity> amenities = amenityService.getAmenitiesByHotelId(hotelId);
        return ResponseEntity.ok(new ApiResponse(true, "Hotel amenities fetched successfully", amenities));
    }

    // GET /api/amenities/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getAmenityById(@PathVariable Long id) {
        Amenity amenity = amenityService.getAmenityById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Amenity fetched successfully", amenity));
    }
}