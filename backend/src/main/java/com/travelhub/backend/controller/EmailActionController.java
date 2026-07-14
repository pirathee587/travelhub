package com.travelhub.backend.controller;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.service.AgentBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.transaction.annotation.Transactional;

@Controller
@RequestMapping("/api/v1/agent/bookings")
@RequiredArgsConstructor
public class EmailActionController {

    private final BookingRepository bookingRepository;
    private final AgentBookingService agentBookingService;

    @Value("${app.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Transactional
    @GetMapping("/{bookingId}/email-accept")
    public String emailAccept(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Retrieve the owner's user ID for the package's agent to perform acceptBooking.
        if (booking.getPkg() != null && booking.getPkg().getAgent() != null && booking.getPkg().getAgent().getOwner() != null) {
            Long agentOwnerUserId = booking.getPkg().getAgent().getOwner().getId();
            agentBookingService.acceptBooking(agentOwnerUserId, bookingId, null);
        } else {
            throw new RuntimeException("Agent details not found for this package");
        }
        
        return "redirect:" + frontendBaseUrl + "/tourist/payment/" + bookingId;
    }

    @Transactional
    @GetMapping("/{bookingId}/email-decline")
    public String emailDecline(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
                
        if (booking.getPkg() != null && booking.getPkg().getAgent() != null && booking.getPkg().getAgent().getOwner() != null) {
            Long agentOwnerUserId = booking.getPkg().getAgent().getOwner().getId();
            agentBookingService.declineBooking(agentOwnerUserId, bookingId, null);
        } else {
            throw new RuntimeException("Agent details not found for this package");
        }
        
        return "redirect:" + frontendBaseUrl + "/tourist/billing";
    }
}
