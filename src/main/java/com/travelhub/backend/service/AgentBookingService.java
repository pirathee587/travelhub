package com.travelhub.backend.service;

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

@Service
@RequiredArgsConstructor
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;

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
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking not found for this agent");
        }
        return toResponse(booking);
    }

    public BookingResponse acceptBooking(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking not found for this agent");
        }
        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }
        booking.setStatus("active");
        booking.setProgress(25);
        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse declineBooking(Long agentId, Long bookingId,
                                          BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking not found for this agent");
        }
        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be declined");
        }
        booking.setStatus("cancelled");
        booking.setProgress(0);
        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponse completeBooking(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getVehicle().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking not found for this agent");
        }
        if (!booking.getStatus().equals("active")) {
            throw new BadRequestException("Only active bookings can be completed");
        }
        booking.setStatus("completed");
        booking.setProgress(100);
        return toResponse(bookingRepository.save(booking));
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