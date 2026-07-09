package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.service.AgentBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentBookingController {

    private final AgentBookingService agentBookingService;

    // GET all bookings (optionally filtered by status)
    @GetMapping("/{agentId}/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @PathVariable Long agentId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(agentBookingService.getAllBookings(agentId, status));
    }

    // GET single booking by ID
    @GetMapping("/{agentId}/bookings/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.getBookingById(agentId, bookingId));
    }

    // PATCH: pending → confirmed (agent accepts + optionally assigns vehicle)
    @PatchMapping("/{agentId}/bookings/{bookingId}/accept")
    public ResponseEntity<BookingResponse> acceptBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody(required = false) BookingActionRequest request) {
        Long vehicleId = (request != null) ? request.getVehicleId() : null;
        Long hotelId = (request != null) ? request.getHotelId() : null;
        return ResponseEntity.ok(agentBookingService.acceptBooking(agentId, bookingId, vehicleId, hotelId));
    }

    // PATCH: assign vehicle to a booking
    @PatchMapping("/{agentId}/bookings/{bookingId}/assign-vehicle")
    public ResponseEntity<BookingResponse> assignVehicle(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody BookingActionRequest request) {
        return ResponseEntity.ok(agentBookingService.assignVehicle(agentId, bookingId, request.getVehicleId()));
    }

    // PATCH: assign driver to a booking
    @PatchMapping("/{agentId}/bookings/{bookingId}/assign-driver")
    public ResponseEntity<BookingResponse> assignDriver(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody BookingActionRequest request) {
        return ResponseEntity.ok(agentBookingService.assignDriver(agentId, bookingId, request.getDriverId()));
    }

    // PATCH: pending → cancelled (agent declines with a reason)
    @PatchMapping("/{agentId}/bookings/{bookingId}/decline")
    public ResponseEntity<BookingResponse> declineBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody BookingActionRequest request) {
        return ResponseEntity.ok(agentBookingService.declineBooking(agentId, bookingId, request));
    }

    // PATCH: confirmed → in_progress (agent manually starts the trip on trip day)
    @PatchMapping("/{agentId}/bookings/{bookingId}/start")
    public ResponseEntity<BookingResponse> startTrip(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.startTrip(agentId, bookingId));
    }

    // PATCH: in_progress → completed (agent manually marks trip as done)
    @PatchMapping("/{agentId}/bookings/{bookingId}/complete")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.completeBooking(agentId, bookingId));
    }

    // PATCH: confirmed or in_progress → cancelled (emergency cancellation by agent)
    @PatchMapping("/{agentId}/bookings/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody(required = false) BookingActionRequest request) {
        return ResponseEntity.ok(agentBookingService.cancelBooking(agentId, bookingId, request));
    }
}