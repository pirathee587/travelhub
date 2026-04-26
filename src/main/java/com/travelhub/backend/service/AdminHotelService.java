package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminHotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminHotelService {

    private final HotelRepository hotelRepository;

    // ── Get All Hotels ────────────────────────────────
    public List<AdminHotelResponse> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Hotel By ID ───────────────────────────────
    public AdminHotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        return mapToResponse(hotel);
    }

    // ── Delete Hotel ──────────────────────────────────
    public void deleteHotel(Long id) {
        hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotelRepository.deleteById(id);
    }

    // ── Map Entity to Response ────────────────────────
    private AdminHotelResponse mapToResponse(Hotel h) {
        return new AdminHotelResponse(
                h.getId(),
                h.getHotelName(),
                h.getDestination(),
                h.getLocation(),
                h.getDescription(),
                h.getPriceFrom(),
                h.getPriceTo(),
                h.getRating(),
                h.getReviewCount(),
                h.getImageUrl(),
                h.getDistrict()
        );
    }
}