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

/**
 * AmenityController manages the feature inventory endpoints for hotel properties.
 * It provides tools for property managers to define and maintain the services provided at their locations.
 */
@RestController
@RequestMapping("/api/v1/amenities")
public class AmenityController {

    @Autowired
    private AmenityService amenityService;

    /**
     * Endpoint to register a new amenity for a specific hotel.
     */
    @PostMapping
    public ResponseEntity<ApiResponse> addAmenity(@RequestBody AmenityRequest request) {
        Amenity amenity = amenityService.addAmenity(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Amenity added successfully", amenity));
    }

    /**
     * Retrieves all amenities registered across the entire platform.
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAllAmenities() {
        List<Amenity> amenities = amenityService.getAllAmenities();
        return ResponseEntity.ok(new ApiResponse(true, "Amenities fetched successfully", amenities));
    }

    /**
     * Retrieves all amenities belonging to a specific hotel property.
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<ApiResponse> getAmenitiesByHotelId(@PathVariable Long hotelId) {
        List<Amenity> amenities = amenityService.getAmenitiesByHotelId(hotelId);
        return ResponseEntity.ok(new ApiResponse(true, "Amenities fetched successfully", amenities));
    }

    /**
     * Retrieves the metadata for a single specific amenity by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getAmenityById(@PathVariable Long id) {
        Amenity amenity = amenityService.getAmenityById(id);
        return ResponseEntity.ok(new ApiResponse(true, "Amenity fetched successfully", amenity));
    }

    /**
     * Endpoint to update the details of an existing hotel amenity.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateAmenity(@PathVariable Long id, @RequestBody AmenityRequest request) {
        Amenity amenity = amenityService.updateAmenity(id, request);
        return ResponseEntity.ok(new ApiResponse(true, "Amenity updated successfully", amenity));
    }

    /**
     * Endpoint to permanently remove an amenity from a hotel's feature list.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAmenity(@PathVariable Long id) {
        amenityService.deleteAmenity(id);
        return ResponseEntity.ok(new ApiResponse(true, "Amenity deleted successfully", null));
    }
}