package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.ReviewRepository;
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
                .progress(booking.getProgress())
                .imageUrl(booking.getPkg() != null ? booking.getPkg().getImageUrl() : null)
                .price(booking.getTotalPrice())
                .category(booking.getPkg() != null ? booking.getPkg().getCategory() : null)
                .hotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null)
                .rating(averageRating)
                .reviewCount(reviewCount)
                .build();
    }

    // Map Booking → BookingResponse
    private BookingResponse toBookingResponse(Booking booking) {
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
                .imageUrl(booking.getPkg() != null ? booking.getPkg().getImageUrl() : null)
                .category(booking.getPkg() != null ? booking.getPkg().getCategory() : null)
                .bookedOn(booking.getCreatedAt())
                .hotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null)
                .hotelLocation(booking.getHotel() != null ? booking.getHotel().getLocation() : null)
                .driverName(booking.getVehicle() != null ? booking.getVehicle().getDriverName() : null)
                .driverPhone(booking.getVehicle() != null ? booking.getVehicle().getDriverPhone() : null)
                .driverRating(booking.getVehicle() != null ? booking.getVehicle().getDriverRating() : null)
                .driverTrips(booking.getVehicle() != null ? booking.getVehicle().getDriverTrips() : null)
                .vehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null)
                .vehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null)
                .vehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null)
                .vehicleCapacity(booking.getVehicle() != null && booking.getVehicle().getCapacity() != null
                        ? booking.getVehicle().getCapacity().toString()
                        : null)
                .build();
    }
}
