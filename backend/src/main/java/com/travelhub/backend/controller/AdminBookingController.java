package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    // GET /api/admin/bookings
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Bookings found", bookingService.getAllBookingsForAdmin()));
    }

    // GET /api/admin/bookings/count
    @GetMapping("/count")
    public ResponseEntity<?> getBookingCount() {
        return ResponseEntity.ok(
                new ApiResponse(true, "Booking count", bookingRepository.count()));
    }
}
