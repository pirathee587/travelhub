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

/**
 * BookingService handles the logic for tourists to view and manage their reservations.
 * It provides methods for retrieving trip histories and detailed booking summaries.
 */
@Service
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Constructor injection for required repositories.
     */
    public BookingService(BookingRepository bookingRepository, ReviewRepository reviewRepository) {
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    /**
     * Retrieves all bookings for a specific user, regardless of their status.
     * Mapped to TripResponse for a concise overview.
     */
    public List<TripResponse> getTripsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves bookings for a user filtered by a specific status (e.g., "COMPLETED", "PENDING").
     */
    public List<TripResponse> getTripsByUserIdAndStatus(Long userId, String status) {
        return bookingRepository.findByUserIdAndStatus(userId, status)
                .stream()
                .map(this::toTripResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all bookings for a user, mapped to detailed BookingResponse DTOs.
     */
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the comprehensive details for a single specific booking.
     */
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        return toBookingResponse(booking);
    }

    /**
     * Maps a Booking entity to a TripResponse DTO.
     * Includes logic to fetch and calculate package ratings for display.
     */
    private TripResponse toTripResponse(Booking booking) {
        Double averageRating = 0.0;
        Long reviewCount = 0L;
        
        // Fetch real-time rating data if the package is still valid
        if (booking.getPkg() != null && booking.getPkg().getId() != null) {
            averageRating = reviewRepository.getAverageRatingByPackageId(booking.getPkg().getId());
            reviewCount = reviewRepository.getReviewCountByPackageId(booking.getPkg().getId());
            
            // Handle null results gracefully
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

    /**
     * Maps a Booking entity to a detailed BookingResponse DTO.
     * This includes detailed hotel, vehicle, and driver information.
     */
    private BookingResponse toBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        // Generate a user-friendly booking ID string (e.g., BK00001)
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
        
        // Link hotel-specific details
        response.setHotelName(booking.getHotel() != null ? booking.getHotel().getHotelName() : null);
        response.setHotelLocation(booking.getHotel() != null ? booking.getHotel().getLocation() : null);
        
        // Link vehicle and driver details if assigned
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
