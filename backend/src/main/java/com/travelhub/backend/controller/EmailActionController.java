package com.travelhub.backend.controller;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.service.AgentBookingService;
import com.travelhub.backend.service.EmailActionPageBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/v1/agent/bookings")
@RequiredArgsConstructor
public class EmailActionController {

    private final BookingRepository bookingRepository;
    private final AgentBookingService agentBookingService;
    private final EmailActionPageBuilder actionPages;

    @Value("${app.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    /**
     * Email "approve" links cannot complete acceptance without vehicle/driver assignment.
     * Show a branded instruction page instead of raw JSON or a failed API response.
     */
    @GetMapping(value = "/{bookingId}/email-accept", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> emailAccept(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return html(actionPages.error(
                    "Booking not found",
                    "We could not find booking BK-" + bookingId + ". It may have already been processed or removed.",
                    "Go to Agency Dashboard",
                    agencyBookingsUrl()));
        }

        if (!"pending".equalsIgnoreCase(booking.getStatus())) {
            return html(actionPages.reviewRequired(
                    "Booking already processed",
                    "Booking BK-" + bookingId + " is no longer pending (current status: "
                            + booking.getStatus() + ").",
                    agencyBookingUrl(bookingId)));
        }

        return html(actionPages.reviewRequired(
                "Complete approval in your dashboard",
                "To accept booking BK-" + bookingId + ", assign a vehicle and driver first.",
                agencyBookingUrl(bookingId)));
    }

    @Transactional
    @GetMapping(value = "/{bookingId}/email-decline", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> emailDecline(@PathVariable Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return html(actionPages.error(
                    "Booking not found",
                    "We could not find booking BK-" + bookingId + ".",
                    "Go to Agency Dashboard",
                    agencyBookingsUrl()));
        }

        if (booking.getPkg() == null || booking.getPkg().getAgent() == null
                || booking.getPkg().getAgent().getOwner() == null) {
            return html(actionPages.error(
                    "Unable to decline booking",
                    "Agent details were not found for this booking.",
                    "Go to Agency Dashboard",
                    agencyBookingsUrl()));
        }

        try {
            Long agentOwnerUserId = booking.getPkg().getAgent().getOwner().getId();
            agentBookingService.declineBooking(agentOwnerUserId, bookingId, null);
            return html(actionPages.success(
                    "Booking declined",
                    "Booking BK-" + bookingId + " has been declined. The tourist will be notified by email.",
                    "View Bookings",
                    agencyBookingsUrl()));
        } catch (BadRequestException | ResourceNotFoundException ex) {
            return html(actionPages.error(
                    "Unable to decline booking",
                    ex.getMessage(),
                    "Open Booking in Dashboard",
                    agencyBookingUrl(bookingId)));
        } catch (Exception ex) {
            return html(actionPages.error(
                    "Something went wrong",
                    "We could not decline booking BK-" + bookingId + ". Please try again from your dashboard.",
                    "Open Booking in Dashboard",
                    agencyBookingUrl(bookingId)));
        }
    }

    private ResponseEntity<String> html(String content) {
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
    }

    private String agencyBookingUrl(Long bookingId) {
        return trimTrailingSlash(frontendBaseUrl) + "/agency/bookings/" + bookingId;
    }

    private String agencyBookingsUrl() {
        return trimTrailingSlash(frontendBaseUrl) + "/agency/bookings";
    }

    private String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
