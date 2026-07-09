package com.travelhub.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.RoomResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.service.HotelPricingService.PriceRange;

import lombok.RequiredArgsConstructor;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final ReviewRepository reviewRepository;
    private final HotelPricingService hotelPricingService;

    public List<HotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findByApplicationStatus("Approved");
        return toHotelResponses(hotels);
    }

    public List<HotelResponse> getHotelsByDestination(String destination) {
        List<Hotel> hotels = hotelRepository.findByDestinationIgnoreCase(destination);
        return toHotelResponses(hotels);
    }

    public List<HotelResponse> getHotelsByDistrict(String district) {
        List<Hotel> hotels = hotelRepository.findByApplicationStatusAndDistrictIgnoreCase("Approved", district);
        return toHotelResponses(hotels);
    }

    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));                 //Error handle
        return toSingleHotelResponse(hotel);
    }

    /**
     * ✅ OPTIMIZED: Batch rating lookup — 2 queries total instead of 2N.
     * Fetches all ratings and counts in bulk, then maps them to responses.
     */
    private List<HotelResponse> toHotelResponses(List<Hotel> hotels) {
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).collect(Collectors.toList());

        // 2 bulk queries instead of 2 per hotel
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);

        return hotels.stream()
                .map(hotel -> toHotelResponse(hotel,
                        avgRatings.getOrDefault(hotel.getId(), 0.0),
                reviewCounts.getOrDefault(hotel.getId(), 0L).intValue(),
                priceRanges.get(hotel.getId())))
                .collect(Collectors.toList());
    }

    /** Single hotel fetch — 2 individual queries is acceptable for detail pages */
    private HotelResponse toSingleHotelResponse(Hotel hotel) {
        Double avgRating = reviewRepository.getAverageRatingByHotelId(hotel.getId());
        Long count = reviewRepository.getReviewCountByHotelId(hotel.getId());
        PriceRange priceRange = hotelPricingService.getPriceRangeByHotelId(hotel.getId());
        return toHotelResponse(hotel,
                avgRating != null ? avgRating : 0.0,
            count != null ? count.intValue() : 0,
            priceRange);
    }

        private HotelResponse toHotelResponse(Hotel hotel, double rating, int reviewCount, PriceRange priceRange) {
        List<String> amenityList = null;
        if (hotel.getAmenityList() != null && !hotel.getAmenityList().isEmpty()) {
            amenityList = hotel.getAmenityList().stream()
                    .map(amenity -> amenity.getName())
                    .collect(Collectors.toList());
        }

        List<RoomResponse> roomResponses = null;
        if (hotel.getRooms() != null && !hotel.getRooms().isEmpty()) {
            roomResponses = hotel.getRooms().stream()
                    .map(room -> new RoomResponse(
                            room.getId(),
                            room.getName(),
                            room.getType(),
                            room.getPrice(),
                            room.getDescription(),
                            room.getImageUrl(),
                            room.getAvailability(),
                            hotel.getId()
                    ))
                    .collect(Collectors.toList());
        }

        return HotelResponse.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .destination(hotel.getDestination())
                .location(hotel.getLocation())
                .description(hotel.getDescription())
                .priceFrom(priceRange != null ? priceRange.priceFrom() : null)
                .priceTo(priceRange != null ? priceRange.priceTo() : null)
                .rating(Math.round(rating * 10.0) / 10.0)
                .reviewCount(reviewCount)
                .imageUrl(getEffectiveImageUrl(hotel))
                .amenities(amenityList)
                .rooms(roomResponses)
                .district(hotel.getDistrict())
                .applicationStatus(hotel.getApplicationStatus())
                .build();
    }

    private String getEffectiveImageUrl(Hotel h) {
        String img = h.getImageUrl();
        if (img != null && !img.trim().isEmpty()) {
            return img;
        }
        if (h.getRooms() != null) {
            for (com.travelhub.backend.entity.Room r : h.getRooms()) {
                if (r.getImageUrl() != null && !r.getImageUrl().trim().isEmpty()) {
                    return r.getImageUrl();
                }
            }
        }
        return null;
    }

    // ── Chatbot data method ────────────────────────────────────────────────
    // Added for AI chatbot feature — returns all hotels as simple maps
    // so the Python RAG service can load them into ChromaDB
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllHotelsForChatbot() {
    return hotelRepository.findAll()
            .stream()
            .map(hotel -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id",          hotel.getId());
                map.put("hotelName",   hotel.getHotelName());
                map.put("destination", hotel.getDestination());
                map.put("location",    hotel.getLocation());
                map.put("district",    hotel.getDistrict());
                map.put("description", hotel.getDescription());
                map.put("priceFrom",   hotel.getPriceFrom());
                map.put("priceTo",     hotel.getPriceTo());
                // Rating is dynamically calculated, default to 0.0 for chatbot if needed, or omit
                map.put("rating",      0.0);
                map.put("amenities",   hotel.getAmenityList() != null ? hotel.getAmenityList().stream().map(a -> a.getName()).collect(Collectors.toList()) : java.util.List.of());
                return map;
            })
            .collect(Collectors.toList());
    }
}