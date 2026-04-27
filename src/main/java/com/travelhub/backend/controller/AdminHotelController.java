package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.service.AdminHotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHotelController {

    private final AdminHotelService adminHotelService;

    // GET /api/admin/hotels
    @GetMapping
    public ResponseEntity<?> getAllHotels() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotels found",
                        adminHotelService.getAllHotels()));
    }

    // GET /api/admin/hotels/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getHotelById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel found",
                        adminHotelService.getHotelById(id)));
    }

    // PATCH /api/admin/hotels/{id}/approve
    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveHotel(@PathVariable Long id) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel approved",
                        adminHotelService.approveHotel(id)));
    }

    // PATCH /api/admin/hotels/{id}/reject
    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectHotel(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel rejected",
                        adminHotelService.rejectHotel(id, reason)));
    }

    // DELETE /api/admin/hotels/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHotel(
            @PathVariable Long id) {
        adminHotelService.deleteHotel(id);
        return ResponseEntity.ok(
                new ApiResponse(true, "Hotel deleted",
                        null));
    }
}