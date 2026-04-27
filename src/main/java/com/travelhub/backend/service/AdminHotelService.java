package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminHotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminHotelService {

    private final HotelRepository hotelRepository;
    private final ApplicationEventPublisher eventPublisher;

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

    // ── Approve Hotel ─────────────────────────────────
    @Transactional
    public AdminHotelResponse approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        
        // Assuming there's a status field in Hotel
        // If not, we might just be setting a flag
        // Let's check Hotel entity first to be sure
        
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "APPROVED"));
        return mapToResponse(hotel);
    }

    // ── Reject Hotel ──────────────────────────────────
    @Transactional
    public AdminHotelResponse rejectHotel(Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "REJECTED", reason));
        return mapToResponse(hotel);
    }

    // ── Delete Hotel ──────────────────────────────────
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "DELETED"));
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