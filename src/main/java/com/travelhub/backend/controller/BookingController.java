package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.BookingRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.service.BookingCreationService;
import com.travelhub.backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tourist")

@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final BookingCreationService bookingCreationService;

    public BookingController(BookingService bookingService, BookingCreationService bookingCreationService) {
        this.bookingService = bookingService;
        this.bookingCreationService = bookingCreationService;
    }

    // GET /api/tourist/trips?userId=1
    @GetMapping("/trips")
    public ResponseEntity<List<TripResponse>> getTrips(
            @RequestParam Long userId,
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getTripsByUserIdAndStatus(userId, status));
        }
        return ResponseEntity.ok(bookingService.getTripsByUserId(userId));
    }

    // GET /api/tourist/trips/1
    @GetMapping("/trips/{id}")
    public ResponseEntity<BookingResponse> getTripDetail(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // GET /api/tourist/bookings?userId=1
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getBookings(@RequestParam Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    // GET /api/tourist/bookings/1
    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // POST /api/tourist/bookings
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingCreationService.createBooking(request));
    }

    // PUT /api/tourist/bookings/1/cancel
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingCreationService.cancelBooking(id));
    }
}