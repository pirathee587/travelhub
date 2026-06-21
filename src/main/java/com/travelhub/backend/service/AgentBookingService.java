package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    // ── GET ALL / GET BY ID ───────────────────────────────────────────────────

    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        List<Booking> bookings;
        if (status != null && !status.equals("all")) {
            bookings = bookingRepository.findByVehicleAgentIdAndStatus(agentId, status);
        } else {
            bookings = bookingRepository.findByVehicleAgentId(agentId);
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long agentId, Long bookingId) {
        Booking booking = findAndValidate(agentId, bookingId);
        return toResponse(booking);
    }

    // ── ACCEPT: pending → confirmed ───────────────────────────────────────────
    // Agent manually accepts a pending booking request.
    // Assigns a vehicle and moves status to "confirmed".
    // The trip has NOT started yet — it is simply approved and waiting for startDate.

    public BookingResponse acceptBooking(Long agentId, Long bookingId, Long vehicleId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }

        // Assign the selected vehicle
        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
            booking.setVehicle(vehicle);
        }

        booking.setStatus("confirmed");   // waiting for trip to start
        booking.setProgress(25);
        return toResponse(bookingRepository.save(booking));
    }

    // ── DECLINE: pending → cancelled ──────────────────────────────────────────
    // Agent declines an incoming booking request.

    public BookingResponse declineBooking(Long agentId, Long bookingId,
                                          BookingActionRequest request) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be declined");
        }

        booking.setStatus("cancelled");
        booking.setProgress(0);
        return toResponse(bookingRepository.save(booking));
    }

    // ── START TRIP: confirmed → in_progress ───────────────────────────────────
    // Agent manually confirms the trip is starting today.
    // System notified the agent earlier (via scheduler) — agent clicks "Start Trip".
    // Only allowed on/after the booking's startDate.

    public BookingResponse startTrip(Long agentId, Long bookingId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only confirmed bookings can be started");
        }

        booking.setStatus("in_progress");
        booking.setProgress(60);
        return toResponse(bookingRepository.save(booking));
    }

    // ── COMPLETE TRIP: in_progress → completed ────────────────────────────────
    // Agent manually marks the trip as done.
    // System notified the agent on/after endDate — agent clicks "Complete Trip".

    public BookingResponse completeBooking(Long agentId, Long bookingId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("in_progress")) {
            throw new BadRequestException("Only in-progress trips can be marked as completed");
        }

        booking.setStatus("completed");
        booking.setProgress(100);
        return toResponse(bookingRepository.save(booking));
    }

    // ── CANCEL: confirmed or in_progress → cancelled ──────────────────────────
    // Emergency cancellation — agent can cancel an accepted or ongoing trip.
    // Requires a reason (e.g. vehicle breakdown, natural disaster).

    public BookingResponse cancelBooking(Long agentId, Long bookingId,
                                         BookingActionRequest request) {
        Booking booking = findAndValidate(agentId, bookingId);

        String status = booking.getStatus();
        if (!status.equals("confirmed") && !status.equals("in_progress")) {
            throw new BadRequestException("Only confirmed or in-progress bookings can be cancelled");
        }

        booking.setStatus("cancelled");
        booking.setProgress(0);
        return toResponse(bookingRepository.save(booking));
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Booking findAndValidate(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        return booking;
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageName(booking.getPkg() != null ? booking.getPkg().getPackageName() : null)
                .destination(booking.getPkg() != null ? booking.getPkg().getDestination() : null)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .progress(booking.getProgress())
                .vehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .vehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null)
                .bookedOn(booking.getCreatedAt())
                .build();
    }
}
