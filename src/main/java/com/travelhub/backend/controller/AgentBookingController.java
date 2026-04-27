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

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentBookingService.getAllBookings(agentId, status));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long bookingId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentBookingService.getBookingById(agentId, bookingId));
    }

    @PatchMapping("/bookings/{bookingId}/accept")
    public ResponseEntity<BookingResponse> acceptBooking(
            @PathVariable Long bookingId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentBookingService.acceptBooking(agentId, bookingId));
    }

    @PatchMapping("/bookings/{bookingId}/decline")
    public ResponseEntity<BookingResponse> declineBooking(
            @PathVariable Long bookingId,
            @RequestBody BookingActionRequest request) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentBookingService.declineBooking(agentId, bookingId, request));
    }

    @PatchMapping("/bookings/{bookingId}/complete")
    public ResponseEntity<BookingResponse> completeBooking(
            @PathVariable Long bookingId) {
        Long agentId = com.travelhub.backend.util.SecurityUtils.getCurrentAgentId();
        if (agentId == null) {
            throw new com.travelhub.backend.common.UnauthorizedException("Agent ID not found in token");
        }
        return ResponseEntity.ok(agentBookingService.completeBooking(agentId, bookingId));
    }
}