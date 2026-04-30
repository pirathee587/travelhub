package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.HotelDashboardStatsResponse;
import com.travelhub.backend.entity.Review;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelOwnerDashboardService {

    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final ReviewRepository reviewRepository;

    public HotelDashboardStatsResponse getDashboardStats(Long hotelId) {
        // Fetch data scoped strictly to this specific hotel
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        long totalRooms = rooms.size();
        long availableRooms = rooms.stream().filter(Room::getAvailability).count();

        long totalAmenities = amenityRepository.findByHotelId(hotelId).size();

        List<Review> reviews = reviewRepository.findByHotelId(hotelId);
        long totalReviews = reviews.size();
        double averageRating = 0.0;
        
        if (totalReviews > 0) {
            averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            
            // Round to 1 decimal place
            averageRating = Math.round(averageRating * 10.0) / 10.0;
        }

        return HotelDashboardStatsResponse.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .totalAmenities(totalAmenities)
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .build();
    }
}
