package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.HotelSummaryResponse;
import com.travelhub.backend.service.OwnerHotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OwnerHotelController {

    private final OwnerHotelService ownerHotelService;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getOwnerHotels(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId,
            @RequestParam(defaultValue = "Approved") String status) {
        return ResponseEntity.ok(ownerHotelService.getOwnerHotels(ownerId, status));
    }

    @GetMapping("/summary")
    public ResponseEntity<HotelSummaryResponse> getHotelSummary(
            @RequestHeader(value = "X-Owner-Id", required = false) Long ownerId) {
        return ResponseEntity.ok(ownerHotelService.getHotelSummary(ownerId));
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
