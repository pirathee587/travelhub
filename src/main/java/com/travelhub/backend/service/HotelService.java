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

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
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
        List<String> amenityList = (hotel.getAmenityList() != null)
                ? hotel.getAmenityList().stream()
                    .map(amenity -> amenity.getName())
                    .collect(Collectors.toList())
                : List.of();

        return HotelResponse.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .destination(hotel.getDestination())
                .location(hotel.getLocation())
                .description(hotel.getDescription())
                .priceFrom(hotel.getPriceFrom())
                .priceTo(hotel.getPriceTo())
                .imageUrl(hotel.getImageUrl())
                .amenities(amenityList)
                .district(hotel.getDistrict())
                .build();
    }
}