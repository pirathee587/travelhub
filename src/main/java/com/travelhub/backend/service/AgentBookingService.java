package com.travelhub.backend.service;

import org.springframework.transaction.annotation.Transactional;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.entity.Vehicle;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserNotificationService userNotificationService;

    /**
     * Returns all bookings visible to the agent.
     * If status is provided and not "all", results are filtered by status.
     */
    @Transactional
    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        List<Booking> bookings;
        if (status != null && !status.equals("all")) {
            // Filter by requested booking status.
            bookings = bookingRepository.findByAgentIdAndStatus(agentId, status);
        } else {
            // Return all bookings for the agent.
            bookings = bookingRepository.findByAgentId(agentId);
        }
        // Convert entities to response DTOs.
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Returns a single booking by id, enforcing ownership by the given agent.
     */
    @Transactional
    public BookingResponse getBookingById(Long agentId, Long bookingId) {
        // Find booking by id.
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        // Ownership check via the package's agent (vehicle may be null for new bookings).
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        return toResponse(booking);
    }

    /**
     * Accepts a booking for the given agent.
     * Optionally assigns a vehicle and marks that vehicle as booked.
     */
    @Transactional
    public BookingResponse acceptBooking(Long agentId, Long bookingId, BookingActionRequest request) {
        // Find booking and enforce ownership.
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "id", bookingId);
        }
        // Allow accepting only pending/confirmed records.
        if (!booking.getStatus().equals("pending") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }

        // Assign a specific vehicle if provided by the request.
        if (request != null && request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
            booking.setVehicle(vehicle);
            // Mark assigned vehicle as unavailable for new trips.
            vehicle.setStatus("booked");
            vehicleRepository.save(vehicle);
        }

        // Move booking to confirmed state (pending → confirmed).
        booking.setStatus("confirmed");
        booking.setProgress(25);
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingEvent(this, saved, "APPROVED"));
        log.info("Booking APPROVED event published for booking {}", bookingId);

        // Persist in-app notification for tourist with payment link
        try {
            userNotificationService.notifyUser(
                    saved.getUser().getId(),
                    "booking",
                    "Booking Approved!",
                    "Your booking for " + saved.getPkg().getPackageName() + " has been approved. Proceed to payment to confirm your trip.",
                    "/payment/" + saved.getId()
            );
        } catch (Exception e) {
            log.warn("Could not create tourist in-app notification for APPROVED booking {}: {}", bookingId, e.getMessage());
        }

        return toResponse(saved);
    }

    /**
     * Declines a booking for the given agent.
     * Allowed only from pending/confirmed states.
     */
    @Transactional
    public BookingResponse declineBooking(Long agentId, Long bookingId,
                                          BookingActionRequest request) {
        // Find booking and enforce ownership.
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        // Status transition guard.
        if (!booking.getStatus().equals("pending") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only pending bookings can be declined");
        }
        // Mark booking as cancelled.
        booking.setStatus("cancelled");
        booking.setProgress(0);

        // Publish decline event so tourist receives email notification.
        String reason = (request != null) ? request.getDeclineReason() : null;
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingEvent(this, saved, "DECLINED", reason));
        log.info("Booking DECLINED event published for booking {}", bookingId);

        // Persist in-app notification for tourist with decline reason
        try {
            String declineMessage = "Your booking for " + saved.getPkg().getPackageName() + " has been declined."
                    + (reason != null ? " Reason: " + reason : " Please contact the agent or try another package.");
            userNotificationService.notifyUser(
                    saved.getUser().getId(),
                    "booking",
                    "Booking Declined",
                    declineMessage,
                    "/my-trips"
            );
        } catch (Exception e) {
            log.warn("Could not create tourist in-app notification for DECLINED booking {}: {}", bookingId, e.getMessage());
        }

        return toResponse(saved);
    }

    /**
     * Completes a booking for the given agent.
     * Allowed from active/in_progress/confirmed states.
     */
    @Transactional
    public BookingResponse completeBooking(Long agentId, Long bookingId) {
        // Find booking and enforce ownership.
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        // Status transition guard.
        if (!booking.getStatus().equals("active") &&
                !booking.getStatus().equals("in_progress") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only active bookings can be completed");
        }
        // Mark booking as completed.
        booking.setStatus("completed");
        booking.setProgress(100);
        return toResponse(bookingRepository.save(booking));
    }

    /**
     * Starts a trip for the given agent.
     * Transitions booking from confirmed → in_progress.
     */
    @Transactional
    public BookingResponse startTrip(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        if (!booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only confirmed bookings can be started");
        }
        booking.setStatus("in_progress");
        booking.setProgress(50);
        return toResponse(bookingRepository.save(booking));
    }

    /**
     * Emergency cancellation by agent for confirmed or in_progress bookings.
     */
    @Transactional
    public BookingResponse cancelBooking(Long agentId, Long bookingId, BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        if (!booking.getStatus().equals("confirmed") &&
                !booking.getStatus().equals("in_progress") &&
                !booking.getStatus().equals("active")) {
            throw new BadRequestException("Only confirmed or in-progress bookings can be cancelled");
        }
        booking.setStatus("cancelled");
        booking.setProgress(0);
        return toResponse(bookingRepository.save(booking));
    }

    /**
     * Null-safe ownership check: verifies that the booking's package belongs to the given agent.
     * Uses pkg->agent chain (always present) instead of vehicle->agent (null for new bookings).
     */
    private boolean isOwnedByAgent(Booking booking, Long agentId) {
        try {
            return booking.getPkg() != null
                    && booking.getPkg().getAgent() != null
                    && booking.getPkg().getAgent().getId().equals(agentId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Maps Booking entity -> API response DTO.
     * Uses null-safe fallback reads for optional package/vehicle relations.
     */
    private BookingResponse toResponse(Booking booking) {
        String packageName = null;
        String destination = null;
        String vehicleType = null;
        String vehicleModel = null;
        String vehicleRegistration = null;

        try {
            if (booking.getPkg() != null) {
                packageName = booking.getPkg().getPackageName();
                destination = booking.getPkg().getDestination();
            }
        } catch (Exception e) {
            // Relation access failed; keep package fields as null.
        }

        try {
            if (booking.getVehicle() != null) {
                vehicleType = booking.getVehicle().getVehicleType();
                vehicleModel = booking.getVehicle().getModel();
                vehicleRegistration = booking.getVehicle().getRegistration();
            }
        } catch (Exception e) {
            // Relation access failed; keep vehicle fields as null.
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageName(packageName)
                .destination(destination)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .progress(booking.getProgress())
                .vehicleType(vehicleType)
                .vehicleModel(vehicleModel)
                .vehicleRegistration(vehicleRegistration)
                .bookedOn(booking.getCreatedAt())
                .adults(booking.getAdults())
                .children(booking.getChildren())
                .specialRequests(booking.getSpecialRequests())
                .duration(booking.getDuration())
                .build();
    }
}
