package com.travelhub.backend.service;

import org.springframework.transaction.annotation.Transactional;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.BookingActionRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.VehicleRepository;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Driver;
import com.travelhub.backend.repository.DriverRepository;

@Service
@RequiredArgsConstructor
public class AgentBookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AgentRepository agentRepository;
    private final HotelRepository hotelRepository;
    private final DriverRepository driverRepository;

    /**
     * Returns all bookings visible to the agent.
     * If status is provided and not "all", results are filtered by status.
     */
    @Transactional
    public List<BookingResponse> getAllBookings(Long agentId, String status) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent", "userId", agentId));
        Long realAgentId = agent.getId();
        List<Booking> bookings;
        if (status != null && !status.equals("all")) {
            // Filter by requested booking status.
            bookings = bookingRepository.findByAgentIdAndStatus(realAgentId, status);
        } else {
            // Retrieve all bookings for this agent.
            bookings = bookingRepository.findByAgentId(realAgentId);
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Object debugVehicles(Long agentId) {
        com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId).orElse(null);
        if (agent == null) return "Agent not found";
        Long realAgentId = agent.getId();
        return java.util.Map.of(
            "realAgentId", realAgentId,
            "allVehicles", vehicleRepository.findByAgentId(realAgentId),
            "activeVehicles", vehicleRepository.findByAgentIdAndLifecycleStatus(realAgentId, "active"),
            "allBookings", bookingRepository.findByAgentId(realAgentId)
        );
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

        // For Single District packages, assign the selected hotel preference or clear it if null/none
        if (booking.getPkg() != null && "SINGLE_DISTRICT".equals(booking.getPkg().getPackageType())) {
            if (request != null && request.getHotelId() != null) {
                Hotel hotel = hotelRepository.findById(request.getHotelId())
                        .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));
                booking.setHotel(hotel);
            } else {
                booking.setHotel(null);
            }
        }

        // Move booking to confirmed state (pending → confirmed).
        booking.setStatus("confirmed");
        booking.setProgress(25);
        Booking saved = bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingEvent(this, saved, "APPROVED"));
        return toResponse(saved);
    }

    /**
     * Assigns a vehicle to a booking.
     */
    @Transactional
    public BookingResponse assignVehicle(Long agentId, Long bookingId, BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "id", bookingId);
        }

        if (request != null && request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
            booking.setVehicle(vehicle);
            vehicle.setStatus("booked");
            vehicleRepository.save(vehicle);
            bookingRepository.save(booking);
        }
        return toResponse(booking);
    }

    /**
     * Assigns a driver to a booking.
     */
    @Transactional
    public BookingResponse assignDriver(Long agentId, Long bookingId, BookingActionRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        if (!isOwnedByAgent(booking, agentId)) {
            throw new ResourceNotFoundException("Booking", "id", bookingId);
        }

        if (request != null && request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", request.getDriverId()));
            booking.setDriver(driver);
            driver.setStatus("on-trip");
            driverRepository.save(driver);
            bookingRepository.save(booking);
        }
        return toResponse(booking);
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
            com.travelhub.backend.entity.Agent agent = agentRepository.findByOwnerId(agentId).orElse(null);
            if (agent == null) return false;
            return booking.getPkg() != null
                    && booking.getPkg().getAgent() != null
                    && booking.getPkg().getAgent().getId().equals(agent.getId());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Maps Booking entity -> API response DTO.
     * Uses null-safe fallback reads for optional package/vehicle relations.
     */
    private BookingResponse toResponse(Booking booking) {
        String packageId = null;
        String packageName = null;
        String destination = null;
        String vehicleType = null;
        String vehicleModel = null;
        String vehicleRegistration = null;

        try {
            if (booking.getPkg() != null) {
                packageId = booking.getPkg().getPackageId();
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
        String touristName = null;
        String touristEmail = null;
        String touristPhone = null;
        try {
            if (booking.getUser() != null) {
                touristName = booking.getUser().getName();
                touristEmail = booking.getUser().getEmail();
                touristPhone = booking.getUser().getTelephone();
            }
        } catch (Exception e) {}

        String packageType = null;
        String imageUrl = null;
        try {
            if (booking.getPkg() != null) {
                packageType = booking.getPkg().getPackageType();
                // If package uses PackageImage entities, you can fetch the first one if imageUrl is null
                imageUrl = booking.getPkg().getImageUrl();
                if (imageUrl == null && booking.getPkg().getImages() != null && !booking.getPkg().getImages().isEmpty()) {
                    imageUrl = booking.getPkg().getImages().get(0).getImageUrl();
                }
            }
        } catch (Exception e) {}

        java.util.List<String> preferredHotels = new java.util.ArrayList<>();
        java.util.List<BookingResponse.HotelPreferenceDetail> hotelPrefDetails = new java.util.ArrayList<>();
        try {
            if (booking.getHotelPreferences() != null) {
                for (com.travelhub.backend.entity.BookingHotelPreference pref : booking.getHotelPreferences()) {
                    if (pref.getHotel() != null) {
                        preferredHotels.add(pref.getPreferenceNumber() + ". " + pref.getHotel().getHotelName() + " (" + pref.getHotel().getLocation() + ")");
                        
                        com.travelhub.backend.entity.Hotel h = pref.getHotel();
                        hotelPrefDetails.add(BookingResponse.HotelPreferenceDetail.builder()
                                .id(pref.getId())
                                .hotelId(h.getId())
                                .preferenceNumber(pref.getPreferenceNumber())
                                .hotelName(h.getHotelName())
                                .imageUrl(h.getImageUrl())
                                .starRating("4") // Defaulting to 4-Star since starRating column is not in entity
                                .district(h.getDistrict())
                                .roomName(pref.getRoomName() != null ? pref.getRoomName() : "Standard Room")
                                .contactNumber(h.getHotelContactNumber() != null ? h.getHotelContactNumber() : h.getPhoneNumber())
                                .email(h.getHotelEmail() != null ? h.getHotelEmail() : h.getOwnerEmail())
                                .build());
                    }
                }
                preferredHotels.sort(java.util.Comparator.comparing(s -> Integer.parseInt(s.split("\\.")[0])));
                hotelPrefDetails.sort(java.util.Comparator.comparing(p -> p.getPreferenceNumber() != null ? p.getPreferenceNumber() : 99));
            }
        } catch (Exception e) {}

        java.util.List<String> itineraryHotels = new java.util.ArrayList<>();
        try {
            if ("MULTI_DISTRICT".equals(packageType) && booking.getPkg() != null && booking.getPkg().getItinerary() != null) {
                for (com.travelhub.backend.entity.PackageItinerary itin : booking.getPkg().getItinerary()) {
                    if (itin.getHotel() != null) {
                        itineraryHotels.add("Day " + itin.getDayNumber() + ": " + itin.getHotel().getHotelName() + " (" + itin.getHotel().getLocation() + ")");
                    } else if (itin.getHotelNameCustom() != null && !itin.getHotelNameCustom().isEmpty()) {
                        itineraryHotels.add("Day " + itin.getDayNumber() + ": " + itin.getHotelNameCustom());
                    }
                }
            }
        } catch (Exception e) {}

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageId(packageId)
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
                .touristName(touristName)
                .touristEmail(touristEmail)
                .touristPhone(touristPhone)
                .packageType(packageType)
                .imageUrl(imageUrl)
                .accommodationOption(booking.getAccommodationOption())
                .hotelIdsWithPreference(booking.getHotelIdsWithPreference())
                .preferredHotels(preferredHotels)
                .itineraryHotels(itineraryHotels)
                .hotelPreferences(hotelPrefDetails)
                .build();
    }
}
