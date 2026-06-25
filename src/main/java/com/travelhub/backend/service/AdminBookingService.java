package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.AdminBookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBookingService {

    private final BookingRepository bookingRepository;

    // ── GET all bookings ─────────────────────────────
    public List<AdminBookingResponse> getAllBookings() {
        return bookingRepository.findAllWithDetails()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET booking by id ────────────────────────────
    public AdminBookingResponse getBookingById(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        return toResponse(b);
    }

    // ── GET bookings by status ───────────────────────
    public List<AdminBookingResponse> getBookingsByStatus(String status) {
        return bookingRepository.findByStatusWithDetails(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── PATCH update status ──────────────────────────
    @Transactional
    public AdminBookingResponse updateStatus(Long id, String status) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        b.setStatus(status);
        return toResponse(bookingRepository.save(b));
    }

    // ── Map entity → DTO ─────────────────────────────
    private AdminBookingResponse toResponse(Booking b) {
        String agentName = null;
        if (b.getPkg() != null && b.getPkg().getAgent() != null) {
            agentName = b.getPkg().getAgent().getAgencyName();
        }

        return AdminBookingResponse.builder()
                .id(b.getId())
                .bookingId(String.format("BK%05d", b.getId()))
                .touristName(b.getUser() != null ? b.getUser().getName() : null)
                .touristEmail(b.getUser() != null ? b.getUser().getEmail() : null)
                .packageName(b.getPkg() != null ? b.getPkg().getPackageName() : null)
                .agentName(agentName)
                .destination(b.getPkg() != null ? b.getPkg().getDestination() : null)
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .status(b.getStatus())
                .totalPrice(b.getTotalPrice())
                .bookedOn(b.getCreatedAt())
                .adults(b.getAdults())
                .children(b.getChildren())
                .build();
    }
}
