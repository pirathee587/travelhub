package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.AgentSettings;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.AgentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final AgentSettingsRepository agentSettingsRepository;

    // Get all trips for a user
    public List<TripResponse> getTripsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    // Get trips by status
    public List<TripResponse> getTripsByUserIdAndStatus(Long userId, String status) {
        return bookingRepository.findByUserIdAndStatus(userId, status)
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    // Get all bookings for a user
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    // Get single booking detail
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        return toBookingResponse(booking);
    }

    // Get all bookings for admin
    public List<BookingResponse> getAllBookingsForAdmin() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    // Map Booking → TripResponse
    private TripResponse toTripResponse(Booking booking) {
        // Calculate average rating and review count for the package
        Double averageRating = 0.0;
        Long reviewCount = 0L;
        
        if (booking.getPkg() != null && booking.getPkg().getId() != null) {
            averageRating = reviewRepository.getAverageRatingByPackageId(booking.getPkg().getId());
            reviewCount = reviewRepository.getReviewCountByPackageId(booking.getPkg().getId());
            
            // Handle null average rating (when no reviews exist)
            if (averageRating == null) {
                averageRating = 0.0;
            }
        }
        
        return TripResponse.builder()
                .id(booking.getId())
                .packageId(booking.getPkg() != null ? booking.getPkg().getId() : null)
                .hotelId(booking.getHotel() != null ? booking.getHotel().getId() : null)
                .packageName(booking.getPkg() != null ? booking.getPkg().getPackageName() : null)
                .destination(booking.getPkg() != null ? booking.getPkg().getDestination() : null)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "UNPAID")
                .progress(calculateProgress(booking))
                .imageUrl(booking.getPkg() != null ? booking.getPkg().getImageUrl() : null)
                .price(booking.getTotalPrice())
                .category(booking.getPkg() != null ? booking.getPkg().getCategory() : null)
                .hotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null)
                .startPlace(booking.getPkg() != null ? booking.getPkg().getStartPlace() : null)
                .endPlace(booking.getPkg() != null ? booking.getPkg().getEndPlace() : null)
                .district(booking.getPkg() != null ? booking.getPkg().getDistrict() : null)
                .rating(averageRating)
                .reviewCount(reviewCount)
                .build();
    }

    // Map Booking → BookingResponse
    private BookingResponse toBookingResponse(Booking booking) {
        String touristName = booking.getUser() != null ? booking.getUser().getName() : null;
        String touristEmail = booking.getUser() != null ? booking.getUser().getEmail() : null;
        String touristPhone = booking.getUser() != null ? booking.getUser().getTelephone() : null;
        String packageType = booking.getPkg() != null ? booking.getPkg().getPackageType() : null;
        String imageUrl = booking.getPkg() != null ? booking.getPkg().getImageUrl() : null;
        if (imageUrl == null && booking.getPkg() != null && booking.getPkg().getImages() != null && !booking.getPkg().getImages().isEmpty()) {
            imageUrl = booking.getPkg().getImages().get(0).getImageUrl();
        }

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
                                .email(h.getHotelEmail() != null ? h.getHotelEmail() : (h.getOwner() != null ? h.getOwner().getEmail() : null))
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
        
        Long agentId = booking.getPkg() != null && booking.getPkg().getAgent() != null ? booking.getPkg().getAgent().getId() : null;
        Integer freeDays = 2;
        Double feePercent = 10.0;
        if (agentId != null) {
            AgentSettings settings = agentSettingsRepository.findByAgentId(agentId).orElse(null);
            if (settings != null) {
                if (settings.getFreeCancellationDays() != null) freeDays = settings.getFreeCancellationDays();
                if (settings.getCancellationFeePercent() != null) feePercent = settings.getCancellationFeePercent();
            }
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingId(String.format("BK%05d", booking.getId()))
                .packageId(booking.getPkg() != null ? String.valueOf(booking.getPkg().getId()) : null)
                .packageName(booking.getPkg() != null ? booking.getPkg().getPackageName() : null)
                .destination(booking.getPkg() != null ? booking.getPkg().getDestination() : null)
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "UNPAID")
                .totalPrice(booking.getTotalPrice())
                .progress(calculateProgress(booking))
                .touristName(touristName)
                .touristEmail(touristEmail)
                .touristPhone(touristPhone)
                .packageType(packageType)
                .accommodationOption(booking.getAccommodationOption())
                .imageUrl(imageUrl)
                .category(booking.getPkg() != null ? booking.getPkg().getCategory() : null)
                .startPlace(booking.getPkg() != null ? booking.getPkg().getStartPlace() : null)
                .endPlace(booking.getPkg() != null ? booking.getPkg().getEndPlace() : null)
                .agentId(agentId)
                .agencyName(booking.getPkg() != null && booking.getPkg().getAgent() != null ? booking.getPkg().getAgent().getAgencyName() : null)
                .freeCancellationDays(freeDays)
                .cancellationFeePercent(feePercent)
                .bookedOn(booking.getCreatedAt())
                .hotelId(booking.getHotel() != null ? booking.getHotel().getId() : null)
                .hotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null)
                .hotelLocation(booking.getHotel() != null ? booking.getHotel().getLocation() : null)
                .driverName(booking.getDriver() != null ? booking.getDriver().getFirstName() + " " + booking.getDriver().getLastName() : (booking.getVehicle() != null ? booking.getVehicle().getDriverName() : null))
                .driverPhone(booking.getDriver() != null ? booking.getDriver().getMobileNumber() : (booking.getVehicle() != null ? booking.getVehicle().getDriverPhone() : null))
                .driverRating(booking.getDriver() != null ? booking.getDriver().getRating() : (booking.getVehicle() != null ? booking.getVehicle().getDriverRating() : null))
                .driverTrips(booking.getVehicle() != null ? booking.getVehicle().getDriverTrips() : null)
                .vehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .vehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null)
                .vehicleCapacity(booking.getVehicle() != null && booking.getVehicle().getCapacity() != null
                        ? booking.getVehicle().getCapacity().toString()
                        : null)
                .adults(booking.getAdults())
                .children(booking.getChildren())
                .specialRequests(booking.getSpecialRequests())
                .duration(booking.getDuration())
                .hotelIdsWithPreference(booking.getHotelIdsWithPreference())
                .preferredHotels(preferredHotels)
                .itineraryHotels(itineraryHotels)
                .hotelPreferences(hotelPrefDetails)
                .build();
    }

    private Integer calculateProgress(Booking booking) {
        if (booking == null || booking.getStatus() == null) return 0;
        String status = booking.getStatus().toLowerCase();
        if ("completed".equals(status)) return 100;
        if ("cancelled".equals(status) || "pending".equals(status) || "confirmed".equals(status)) return 0;

        if ("in_progress".equals(status) || "active".equals(status)) {
            if (booking.getStartDate() == null) return 0;
            java.time.LocalDate start = booking.getStartDate();
            java.time.LocalDate end = booking.getEndDate() != null ? booking.getEndDate() : start;
            long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end);
            if (totalDays <= 0) totalDays = 1;

            java.time.LocalDate today = java.time.LocalDate.now();
            long daysPassed = java.time.temporal.ChronoUnit.DAYS.between(start, today);
            if (daysPassed <= 0) return 0; // Day 1 underway, 0 full days finished

            long completedDays = Math.min(daysPassed, totalDays - 1);
            int calc = (int) Math.round(((double) completedDays / totalDays) * 100.0);
            return Math.min(99, Math.max(0, calc));
        }
        return booking.getProgress() != null ? booking.getProgress() : 0;
    }
}
