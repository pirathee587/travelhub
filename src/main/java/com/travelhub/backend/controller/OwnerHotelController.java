package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.service.OwnerHotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * OwnerHotelController manages the property inventory endpoints for hotel owners.
 * It provides tools for owners to register their hotels, update property details, and handle multimedia uploads.
 */
@RestController
@RequestMapping("/api/v1/owner/hotels")
@CrossOrigin(origins = "*")
public class OwnerHotelController {

    private final OwnerHotelService ownerHotelService;

    /**
     * Constructor injection for hotel owner business logic.
     */
    public OwnerHotelController(OwnerHotelService ownerHotelService) {
        this.ownerHotelService = ownerHotelService;
    }

    /**
     * Retrieves the list of hotels managed by the authenticated owner.
     * Supports filtering by application status (e.g., 'Pending', 'Approved').
     */
    @GetMapping
    public ResponseEntity<List<HotelResponse>> getOwnerHotels(
            @RequestParam(defaultValue = "Approved") String status) {
        return ResponseEntity.ok(ownerHotelService.getOwnerHotels(status));
    }

    /**
     * Endpoint for owners to register a new hotel property.
     * Uses @ModelAttribute to handle form data and @RequestParam for the multimedia image file.
     */
    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage,
            java.security.Principal principal) {
        // Resolve owner identity from security context or request fallback
        String email = principal != null ? principal.getName() : request.getOwnerEmail();
        return ResponseEntity.ok(ownerHotelService.createHotel(request, hotelImage, email));
    }

    /**
     * Endpoint to update the comprehensive details of an existing hotel listing.
     * Supports optional image replacement.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage) {
        return ResponseEntity.ok(ownerHotelService.updateHotel(id, request, hotelImage));
    }

    /**
     * Endpoint to permanently remove a hotel listing from the platform.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        ownerHotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
