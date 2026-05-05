package com.travelhub.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.service.HotelPricingService.PriceRange;

@Service
@Transactional(readOnly = true)
public class HotelService {

    private final HotelRepository hotelRepository;
    private final ReviewRepository reviewRepository;
    private final HotelPricingService hotelPricingService;

    public HotelService(HotelRepository hotelRepository, ReviewRepository reviewRepository, HotelPricingService hotelPricingService) {
        this.hotelRepository = hotelRepository;
        this.reviewRepository = reviewRepository;
        this.hotelPricingService = hotelPricingService;
    }

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
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return toSingleHotelResponse(hotel);
    }

    /**
     * ✅ OPTIMIZED: Batch rating lookup — 2 queries total instead of 2N.
     * Fetches all ratings and counts in bulk, then maps them to responses.
     */
    private List<HotelResponse> toHotelResponses(List<Hotel> hotels) {
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).collect(Collectors.toList());

        // bulk queries
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

    /** Single hotel fetch — individual queries for detail pages */
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

        HotelResponse response = new HotelResponse();
        response.setId(hotel.getId());
        response.setHotelName(hotel.getHotelName());
        response.setDestination(hotel.getDestination());
        response.setLocation(hotel.getLocation());
        response.setDescription(hotel.getDescription());
        response.setPriceFrom(priceRange != null ? priceRange.priceFrom() : null);
        response.setPriceTo(priceRange != null ? priceRange.priceTo() : null);
        response.setRating(Math.round(rating * 10.0) / 10.0);
        response.setReviewCount(reviewCount);
        response.setImageUrl(hotel.getImageUrl());
        response.setAmenities(amenityList);
        response.setDistrict(hotel.getDistrict());
        response.setApplicationStatus(hotel.getApplicationStatus());
        response.setHotelEmail(hotel.getHotelEmail());
        response.setHotelContactNumber(hotel.getHotelContactNumber());
        return response;
    }
}