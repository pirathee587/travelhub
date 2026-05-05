package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.service.OwnerHotelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/hotels")
@CrossOrigin(origins = "*")
public class OwnerHotelController {

    private final OwnerHotelService ownerHotelService;

    public OwnerHotelController(OwnerHotelService ownerHotelService) {
        this.ownerHotelService = ownerHotelService;
    }

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getOwnerHotels(
            @RequestParam(defaultValue = "Approved") String status) {
        return ResponseEntity.ok(ownerHotelService.getOwnerHotels(status));
    }

    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage,
            java.security.Principal principal) {
        String email = principal != null ? principal.getName() : request.getOwnerEmail();
        return ResponseEntity.ok(ownerHotelService.createHotel(request, hotelImage, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage) {
        return ResponseEntity.ok(ownerHotelService.updateHotel(id, request, hotelImage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        ownerHotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
