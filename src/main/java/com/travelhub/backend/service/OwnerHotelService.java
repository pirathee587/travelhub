package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerHotelService {

    private final HotelRepository hotelRepository;
    private final ReviewRepository reviewRepository;

    public List<HotelResponse> getOwnerHotels() {
        // For now, returning all hotels, or implement owner filtering if user context exists.
        return hotelRepository.findAll().stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    public HotelResponse createHotel(OwnerHotelRequest request) {
        Hotel hotel = Hotel.builder()
                .hotelName(request.getHotelName())
                .destination(request.getDestination())
                .location(request.getLocation())
                .description(request.getDescription())
                .priceFrom(request.getPriceFrom())
                .priceTo(request.getPriceTo())
                .imageUrl(request.getImageUrl())
                .district(request.getDistrict())
                .phoneNumber(request.getPhoneNumber())
                .hotlineNumber(request.getHotlineNumber())
                .ownerName(request.getOwnerName())
                .ownerEmail(request.getOwnerEmail())
                .ownerNic(request.getOwnerNic())
                .applicationStatus("Pending")
                .build();

        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    public HotelResponse updateHotel(Long id, OwnerHotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

        hotel.setHotelName(request.getHotelName());
        hotel.setDestination(request.getDestination());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
        hotel.setPriceFrom(request.getPriceFrom());
        hotel.setPriceTo(request.getPriceTo());
        hotel.setImageUrl(request.getImageUrl());
        hotel.setDistrict(request.getDistrict());
        hotel.setPhoneNumber(request.getPhoneNumber());
        hotel.setHotlineNumber(request.getHotlineNumber());
        hotel.setOwnerName(request.getOwnerName());
        hotel.setOwnerEmail(request.getOwnerEmail());
        hotel.setOwnerNic(request.getOwnerNic());

        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
    }

    private HotelResponse toHotelResponse(Hotel hotel) {
        List<String> amenityList = null;
        if (hotel.getAmenityList() != null && !hotel.getAmenityList().isEmpty()) {
            amenityList = hotel.getAmenityList().stream()
                    .map(amenity -> amenity.getName())
                    .collect(Collectors.toList());
        } else if (hotel.getAmenities() != null) {
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
}
