package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import com.travelhub.backend.repository.ReviewRepository;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;
    private final ReviewRepository reviewRepository;

    public List<HotelResponse> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    public List<HotelResponse> getHotelsByDestination(String destination) {
        return hotelRepository.findByDestinationIgnoreCase(destination)
                .stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return toHotelResponse(hotel);
    }

    private HotelResponse toHotelResponse(Hotel hotel) {
        List<String> amenityList = null;
        if (hotel.getAmenities() != null) {
            amenityList = Arrays.asList(hotel.getAmenities().split(","));
        }

        return HotelResponse.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .destination(hotel.getDestination())
                .location(hotel.getLocation())
                .description(hotel.getDescription())
                .priceFrom(hotel.getPriceFrom())
                .priceTo(hotel.getPriceTo())
                .rating(reviewRepository.getAverageRatingByHotelId(hotel.getId()) != null ?
                        Math.round(reviewRepository.getAverageRatingByHotelId(hotel.getId()) * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewRepository.getReviewCountByHotelId(hotel.getId()) != null ?
                        reviewRepository.getReviewCountByHotelId(hotel.getId()).intValue() : 0)
                .imageUrl(hotel.getImageUrl())
                .amenities(amenityList)
                .district(hotel.getDistrict())
                .build();
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
                map.put("rating",      hotel.getRating());
                map.put("amenities",   hotel.getAmenities());
                return map;
            })
            .collect(Collectors.toList());
    }
}