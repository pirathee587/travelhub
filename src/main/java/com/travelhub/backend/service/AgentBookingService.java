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
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import com.travelhub.backend.entity.Vehicle;

@Service
@RequiredArgsConstructor
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        List<Booking> bookings;
        if (status != null && !status.equals("all")) {
            bookings = bookingRepository.findByAgentIdAndStatus(agentId, status);
        } else {
            bookings = bookingRepository.findByAgentId(agentId);
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse getBookingById(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse acceptBooking(Long agentId, Long bookingId, BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "id", bookingId);
        }
        if (!booking.getStatus().equals("pending") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }

        // Assign vehicle if provided
        if (request != null && request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
            booking.setVehicle(vehicle);
            vehicle.setStatus("booked");
            vehicleRepository.save(vehicle);
        }

        booking.setStatus("active");
        booking.setProgress(25);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse declineBooking(Long agentId, Long bookingId,
                                          BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        if (!booking.getStatus().equals("pending") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only pending bookings can be declined");
        }
        booking.setStatus("cancelled");
        booking.setProgress(0);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse completeBooking(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        if (!booking.getStatus().equals("active") &&
                !booking.getStatus().equals("in_progress") &&
                !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only active bookings can be completed");
        }
        booking.setStatus("completed");
        booking.setProgress(100);
        return toResponse(bookingRepository.save(booking));
    }

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
            // lazy load failed — leave as null
        }

        try {
            if (booking.getVehicle() != null) {
                vehicleType = booking.getVehicle().getVehicleType();
                vehicleModel = booking.getVehicle().getModel();
                vehicleRegistration = booking.getVehicle().getRegistration();
            }
        } catch (Exception e) {

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
