package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.dto.response.TripResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public BookingService(BookingRepository bookingRepository, ReviewRepository reviewRepository) {
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

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

        TripResponse response = new TripResponse();
        response.setId(booking.getId());
        response.setPackageId(booking.getPkg() != null ? booking.getPkg().getId() : null);
        response.setHotelId(booking.getHotel() != null ? booking.getHotel().getId() : null);
        response.setPackageName(booking.getPkg() != null ? booking.getPkg().getPackageName() : null);
        response.setDestination(booking.getPkg() != null ? booking.getPkg().getDestination() : null);
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setStatus(booking.getStatus());
        response.setProgress(booking.getProgress());
        response.setImageUrl(booking.getPkg() != null ? booking.getPkg().getImageUrl() : null);
        response.setPrice(booking.getTotalPrice());
        response.setCategory(booking.getPkg() != null ? booking.getPkg().getCategory() : null);
        response.setHotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null);
        response.setRating(averageRating);
        response.setReviewCount(reviewCount);
        return response;
    }

    // Map Booking → BookingResponse
    private BookingResponse toBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingId(String.format("BK%05d", booking.getId()));
        response.setPackageName(booking.getPkg() != null ? booking.getPkg().getPackageName() : null);
        response.setDestination(booking.getPkg() != null ? booking.getPkg().getDestination() : null);
        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setProgress(booking.getProgress());
        response.setImageUrl(booking.getPkg() != null ? booking.getPkg().getImageUrl() : null);
        response.setCategory(booking.getPkg() != null ? booking.getPkg().getCategory() : null);
        response.setBookedOn(booking.getCreatedAt());
        response.setHotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null);
        response.setHotelLocation(booking.getHotel() != null ? booking.getHotel().getLocation() : null);
        response.setDriverName(booking.getVehicle() != null ? booking.getVehicle().getDriverName() : null);
        response.setDriverPhone(booking.getVehicle() != null ? booking.getVehicle().getDriverPhone() : null);
        response.setDriverRating(booking.getVehicle() != null ? booking.getVehicle().getDriverRating() : null);
        response.setDriverTrips(booking.getVehicle() != null ? booking.getVehicle().getDriverTrips() : null);
        response.setVehicleType(booking.getVehicle() != null ? booking.getVehicle().getVehicleType() : null);
        response.setVehicleModel(booking.getVehicle() != null ? booking.getVehicle().getModel() : null);
        response.setVehicleRegistration(booking.getVehicle() != null ? booking.getVehicle().getRegistration() : null);
        response.setVehicleCapacity(booking.getVehicle() != null && booking.getVehicle().getCapacity() != null
                ? booking.getVehicle().getCapacity().toString()
                : null);
        return response;
    }
}
