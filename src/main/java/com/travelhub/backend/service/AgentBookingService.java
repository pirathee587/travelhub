package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.DriverRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import com.travelhub.backend.event.BookingEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ApplicationEventPublisher eventPublisher;

    // ── GET ALL / GET BY ID ───────────────────────────────────────────────────

    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        List<Booking> bookings;
        if (status != null && !status.equals("all")) {
            bookings = bookingRepository.findByAgentIdAndStatus(agentId, status);
        } else {
            bookings = bookingRepository.findByAgentId(agentId);
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long agentId, Long bookingId) {
        Booking booking = findAndValidate(agentId, bookingId);
        return toResponse(booking);
    }

    // ── ACCEPT: pending → confirmed ───────────────────────────────────────────
    // Agent accepts a booking. Vehicle/driver can be assigned before or after.

    public BookingResponse acceptBooking(Long agentId, Long bookingId, Long vehicleId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
            booking.setVehicle(vehicle);
        }

        booking.setStatus("confirmed");
        booking.setProgress(25);
        Booking saved = bookingRepository.save(booking);

        // Force load lazy-loaded proxies before publishing event to async listener
        if (saved.getUser() != null) {
            saved.getUser().getEmail();
        }
        if (saved.getPkg() != null) {
            saved.getPkg().getPackageName();
            if (saved.getPkg().getAgent() != null) {
                saved.getPkg().getAgent().getAgencyName();
            }
        }

        eventPublisher.publishEvent(new BookingEvent(this, saved, "APPROVED"));
        return toResponse(saved);
    }

    // ── ASSIGN VEHICLE ────────────────────────────────────────────────────────

    public BookingResponse assignVehicle(Long agentId, Long bookingId, Long vehicleId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (booking.getStatus().equals("cancelled")) {
            throw new BadRequestException("Cannot assign a vehicle to a cancelled booking");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        booking.setVehicle(vehicle);
        return toResponse(bookingRepository.save(booking));
    }

    // ── ASSIGN DRIVER ─────────────────────────────────────────────────────────

    public BookingResponse assignDriver(Long agentId, Long bookingId, Long driverId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (booking.getStatus().equals("cancelled")) {
            throw new BadRequestException("Cannot assign a driver to a cancelled booking");
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));
        booking.setDriver(driver);
        return toResponse(bookingRepository.save(booking));
    }

    // ── DECLINE: pending → cancelled ──────────────────────────────────────────

    public BookingResponse declineBooking(Long agentId, Long bookingId,
                                          BookingActionRequest request) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("pending")) {
            throw new BadRequestException("Only pending bookings can be declined");
        }

        booking.setStatus("cancelled");
        booking.setProgress(0);
        Booking saved = bookingRepository.save(booking);

        // Force load lazy-loaded proxies before publishing event to async listener
        if (saved.getUser() != null) {
            saved.getUser().getEmail();
        }
        if (saved.getPkg() != null) {
            saved.getPkg().getPackageName();
            if (saved.getPkg().getAgent() != null) {
                saved.getPkg().getAgent().getAgencyName();
            }
        }

        eventPublisher.publishEvent(new BookingEvent(this, saved, "DECLINED", request != null ? request.getDeclineReason() : "Declined by agent"));
        return toResponse(saved);
    }

    // ── START TRIP: confirmed → in_progress ───────────────────────────────────

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

    public BookingResponse cancelBooking(Long agentId, Long bookingId,
                                         BookingActionRequest request) {
        Booking booking = findAndValidate(agentId, bookingId);

        String status = booking.getStatus();
        if (!status.equals("confirmed") && !status.equals("in_progress")) {
            throw new BadRequestException("Only confirmed or in-progress bookings can be cancelled");
        }

        booking.setStatus("cancelled");
        booking.setProgress(0);
        Booking saved = bookingRepository.save(booking);

        // Force load lazy-loaded proxies before publishing event to async listener
        if (saved.getUser() != null) {
            saved.getUser().getEmail();
        }
        if (saved.getPkg() != null) {
            saved.getPkg().getPackageName();
            if (saved.getPkg().getAgent() != null) {
                saved.getPkg().getAgent().getAgencyName();
            }
        }

        eventPublisher.publishEvent(new BookingEvent(this, saved, "CANCELLED", request != null ? request.getCancelReason() : "Cancelled by agent"));
        return toResponse(saved);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Booking findAndValidate(Long agentId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (booking.getPkg() == null || !booking.getPkg().getAgent().getId().equals(agentId)) {
            throw new ResourceNotFoundException("Booking", "agentId", agentId);
        }
        return booking;
    }

    private BookingResponse toResponse(Booking booking) {
        Driver d = booking.getDriver();
        com.travelhub.backend.entity.User tourist = booking.getUser();
        com.travelhub.backend.entity.Package pkg = booking.getPkg();

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageName(pkg != null ? pkg.getPackageName() : null)
                .touristName(tourist != null ? tourist.getName() : null)
                .touristEmail(tourist != null ? tourist.getEmail() : null)
                .touristPhone(tourist != null ? tourist.getTelephone() : null)
                .basePriceAdult(pkg != null ? pkg.getBasePriceAdult() : null)
                .basePriceChild(pkg != null ? pkg.getBasePriceChild() : null)

                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .progress(booking.getProgress())
                .adults(booking.getAdults())
                .children(booking.getChildren())
                .specialRequests(booking.getSpecialRequests())
                .duration(booking.getDuration())
                .imageUrl(pkg != null ? (pkg.getImageUrl() != null ? pkg.getImageUrl() : (pkg.getImages() != null && !pkg.getImages().isEmpty() ? pkg.getImages().get(0).getImageUrl() : null)) : null)
                .accommodationOption(booking.getAccommodationOption())
                .packageType(booking.getPkg() != null ? booking.getPkg().getPackageType() : null)
                .hotelIdsWithPreference(booking.getHotelIdsWithPreference())
                .vehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .vehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null)
                .driverName(d != null ? (d.getFirstName() + (d.getLastName() != null ? " " + d.getLastName() : "")) : null)
                .driverPhone(d != null ? d.getMobileNumber() : null)
                .driverRating(d != null ? d.getRating() : null)
                .bookedOn(booking.getCreatedAt())
                .build();
    }
}
