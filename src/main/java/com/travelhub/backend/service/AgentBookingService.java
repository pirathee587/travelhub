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
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.BookingHotelPreference;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.dto.response.BookingHotelPreferenceResponse;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import com.travelhub.backend.event.BookingEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PaymentRepository paymentRepository;
    private final HotelRepository hotelRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserNotificationService userNotificationService;

    // ── GET ALL / GET BY ID ───────────────────────────────────────────────────

    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();
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

    public BookingResponse acceptBooking(Long agentId, Long bookingId, Long vehicleId, Long hotelId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("pending") && !booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only pending bookings can be accepted");
        }

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
            booking.setVehicle(vehicle);
        }

        if (hotelId != null) {
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", hotelId));
            booking.setHotel(hotel);
        } else {
            booking.setHotel(null);
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

        if (!booking.getStatus().equals("pending") && !booking.getStatus().equals("confirmed")) {
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

        String reason = (request != null) ? request.getDeclineReason() : null;
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

    // ── START TRIP: confirmed → in_progress ───────────────────────────────────

    public BookingResponse startTrip(Long agentId, Long bookingId) {
        Booking booking = findAndValidate(agentId, bookingId);

        if (!booking.getStatus().equals("confirmed")) {
            throw new BadRequestException("Only confirmed bookings can be started");
        }

        booking.setStatus("in_progress");
        booking.setProgress(60);

        // Automate status update
        if (booking.getDriver() != null) {
            booking.getDriver().setStatus("on-trip");
        }
        if (booking.getVehicle() != null) {
            booking.getVehicle().setStatus("booked");
            booking.getVehicle().setIsAvailable(false);
        }

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

        // Automate status update (only revert if not overridden by maintenance/off-duty)
        if (booking.getDriver() != null && "on-trip".equals(booking.getDriver().getStatus())) {
            booking.getDriver().setStatus("available");
        }
        if (booking.getVehicle() != null && "booked".equals(booking.getVehicle().getStatus())) {
            booking.getVehicle().setStatus("available");
            booking.getVehicle().setIsAvailable(true);
        }

        return toResponse(bookingRepository.save(booking));
    }

    // ── CANCEL: confirmed or in_progress → cancelled ──────────────────────────

    public BookingResponse cancelBooking(Long agentId, Long bookingId,
                                         BookingActionRequest request) {
        Booking booking = findAndValidate(agentId, bookingId);

        String status = booking.getStatus();
        if (!status.equals("confirmed") && !status.equals("in_progress") && !status.equals("active")) {
            throw new BadRequestException("Only confirmed or in-progress bookings can be cancelled");
        }

        booking.setStatus("cancelled");
        booking.setProgress(0);

        // Automate status update (only revert if not overridden by maintenance/off-duty)
        if (booking.getDriver() != null && "on-trip".equals(booking.getDriver().getStatus())) {
            booking.getDriver().setStatus("available");
        }
        if (booking.getVehicle() != null && "booked".equals(booking.getVehicle().getStatus())) {
            booking.getVehicle().setStatus("available");
            booking.getVehicle().setIsAvailable(true);
        }

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

    private boolean isOwnedByAgent(Booking booking, Long agentId) {
        try {
            com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId).orElse(null);
            if (agent == null) return false;
            return booking.getPkg() != null
                    && booking.getPkg().getAgent() != null
                    && booking.getPkg().getAgent().getId().equals(agent.getId());
        } catch (Exception e) {
            return false;
        }
    }

    private BookingResponse toResponse(Booking booking) {
        Driver d = booking.getDriver();
        com.travelhub.backend.entity.User tourist = booking.getUser();
        com.travelhub.backend.entity.Package pkg = booking.getPkg();

        List<Payment> payments = paymentRepository.findByBookingId(booking.getId());
        boolean isPaid = payments.stream()
                .anyMatch(p -> "Completed".equalsIgnoreCase(p.getStatus()) && "Payment".equalsIgnoreCase(p.getType()));

        List<BookingHotelPreferenceResponse> prefResponses = new ArrayList<>();
        if (booking.getHotelPreferences() != null) {
            for (BookingHotelPreference pref : booking.getHotelPreferences()) {
                Hotel h = pref.getHotel();
                if (h != null) {
                    String contact = h.getHotelContactNumber();
                    if (contact == null || contact.trim().isEmpty()) {
                        contact = h.getPhoneNumber();
                    }
                    if (contact == null || contact.trim().isEmpty()) {
                        contact = h.getHotlineNumber();
                    }

                    prefResponses.add(BookingHotelPreferenceResponse.builder()
                            .id(pref.getId())
                            .hotelId(h.getId())
                            .hotelName(h.getHotelName())
                            .starRating("")
                            .district(h.getDistrict())
                            .imageUrl((h.getHotelImages() != null && !h.getHotelImages().isEmpty())
                                    ? h.getHotelImages().get(0).getImageUrl()
                                    : h.getImageUrl())
                            .contactNumber(contact)
                            .email(h.getHotelEmail())
                            .roomName(pref.getRoomName())
                            .preferenceNumber(pref.getPreferenceNumber())
                            .isSelected(pref.getIsSelected())
                            .build());
                }
            }
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageName(pkg != null ? pkg.getPackageName() : null)
                .packageId(pkg != null ? pkg.getPackageId() : null)
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
                .hotelId(booking.getHotel() != null ? booking.getHotel().getId() : null)
                .hotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null)
                .hotelLocation(booking.getHotel() != null ? booking.getHotel().getLocation() : null)
                .hotelIdsWithPreference(booking.getHotelIdsWithPreference())
                .vehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .vehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null)
                .driverName(d != null ? (d.getFirstName() + (d.getLastName() != null ? " " + d.getLastName() : "")) : null)
                .driverPhone(d != null ? d.getMobileNumber() : null)
                .driverRating(d != null ? d.getRating() : null)
                .bookedOn(booking.getCreatedAt())
                .isPaid(isPaid)
                .hotelPreferences(prefResponses)
                .build();
    }
}
