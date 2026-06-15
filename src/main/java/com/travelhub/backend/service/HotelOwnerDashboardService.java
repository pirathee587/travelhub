package com.travelhub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.travelhub.backend.dto.response.HotelDashboardStatsResponse;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;

/**
 * HotelOwnerDashboardService provides a high-level operational summary for hotel managers.
 * It aggregates statistics for room availability, property amenities, and customer feedback for a single hotel property.
 */
@Service
public class HotelOwnerDashboardService {

    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Constructor injection for repositories scoped to hotel inventory and feedback.
     */
    public HotelOwnerDashboardService(
            RoomRepository roomRepository,
            AmenityRepository amenityRepository,
            ReviewRepository reviewRepository) {
        this.roomRepository = roomRepository;
        this.amenityRepository = amenityRepository;
        this.reviewRepository = reviewRepository;
    }

    /**
     * Aggregates and returns core metrics for a specific hotel's owner dashboard.
     * Includes real-time room availability counts and calculated rating summaries.
     */
    public HotelDashboardStatsResponse getDashboardStats(Long hotelId) {
        // Fetch inventory data scoped strictly to this specific hotel
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        long totalRooms = rooms.size();
        
        // Calculate current real-time availability
        long availableRooms = rooms.stream()
                .filter(r -> Boolean.TRUE.equals(r.getAvailability()))
                .count();

        // Count total registered features/amenities for the property
        long totalAmenities = amenityRepository.findByHotelId(hotelId).size();

        // Retrieve and analyze customer feedback
        List<Review> reviews = reviewRepository.findByHotel_Id(hotelId);
        long totalReviews = reviews.size();
        double averageRating = 0.0;
        
        if (totalReviews > 0) {
            // Calculate mathematical average of star ratings
            averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            
            // Round result to 1 decimal place for UI consistency
            averageRating = Math.round(averageRating * 10.0) / 10.0;
        }

        // Map aggregated metrics to the dashboard response DTO
        HotelDashboardStatsResponse response = new HotelDashboardStatsResponse();
        response.setTotalRooms(totalRooms);
        response.setAvailableRooms(availableRooms);
        response.setTotalAmenities(totalAmenities);
        response.setTotalReviews(totalReviews);
        response.setAverageRating(averageRating);
        return response;
    }
}
