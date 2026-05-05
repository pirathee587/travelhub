package com.travelhub.backend.controller;

import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.service.AgentBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/agent")
public class AgentBookingController {

    private final AgentBookingService agentBookingService;
    public AgentBookingController(AgentBookingService agentBookingService) {
        this.agentBookingService = agentBookingService;
    }


    @GetMapping("/{agentId}/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @PathVariable Long agentId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(agentBookingService.getAllBookings(agentId, status));
    }

    @GetMapping("/{agentId}/bookings/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.getBookingById(agentId, bookingId));
    }

    @PatchMapping("/{agentId}/bookings/{bookingId}/accept")
    public ResponseEntity<BookingResponse> acceptBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.acceptBooking(agentId, bookingId));
    }

    @PatchMapping("/{agentId}/bookings/{bookingId}/decline")
    public ResponseEntity<BookingResponse> declineBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId,
            @RequestBody BookingActionRequest request) {
        return ResponseEntity.ok(agentBookingService.declineBooking(agentId, bookingId, request));
    }

    @PatchMapping("/{agentId}/bookings/{bookingId}/complete")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Long agentId,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(agentBookingService.completeBooking(agentId, bookingId));
    }
}