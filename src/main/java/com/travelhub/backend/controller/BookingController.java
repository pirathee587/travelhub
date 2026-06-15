package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.BookingRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.service.BookingCreationService;
import com.travelhub.backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * BookingController manages all customer-facing travel reservation endpoints.
 * It handles the full lifecycle of a booking from creation and payment tracking to trip history and cancellations.
 */
@RestController
@RequestMapping("/api/tourist")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final BookingCreationService bookingCreationService;

    /**
     * Constructor injection for booking retrieval and complex creation logic.
     */
    public BookingController(BookingService bookingService, BookingCreationService bookingCreationService) {
        this.bookingService = bookingService;
        this.bookingCreationService = bookingCreationService;
    }

    /**
     * Retrieves all trips associated with a user.
     * Supports optional filtering by trip status (e.g., 'completed', 'confirmed', 'cancelled').
     */
    @GetMapping("/trips")
    public ResponseEntity<List<TripResponse>> getTrips(
            @RequestParam Long userId,
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(bookingService.getTripsByUserIdAndStatus(userId, status));
        }
        return ResponseEntity.ok(bookingService.getTripsByUserId(userId));
    }

    /**
     * Retrieves detailed information for a specific trip by its unique ID.
     */
    @GetMapping("/trips/{id}")
    public ResponseEntity<BookingResponse> getTripDetail(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * Retrieves a flat list of all bookings (raw reservations) for a user.
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getBookings(@RequestParam Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    /**
     * Retrieves a single booking's details, including linked package and pricing metadata.
     */
    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * Endpoint to register a new travel reservation.
     * Triggers complex validation for dates, availability, and district constraints.
     */
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingCreationService.createBooking(request));
    }

    /**
     * Endpoint to request the cancellation of an existing booking.
     * Updates the status and handles associated system events.
     */
    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingCreationService.cancelBooking(id));
    }
}