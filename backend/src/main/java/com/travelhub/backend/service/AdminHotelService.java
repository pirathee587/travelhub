package com.travelhub.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminHotelDetailResponse;
import com.travelhub.backend.dto.response.AdminHotelResponse;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.HotelPricingService.PriceRange;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminHotelService {

    private final HotelRepository            hotelRepository;
    private final RoomRepository             roomRepository;
    private final AmenityRepository          amenityRepository;
    private final ReviewRepository           reviewRepository;
    private final HotelPricingService        hotelPricingService;
    private final UserRepository             userRepository;
    private final ApplicationEventPublisher  eventPublisher;

    // ── Get All Hotels ────────────────────────────────
    public List<AdminHotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);

        // Build room counts and room image fallbacks from explicitly fetched rooms
        Map<Long, Integer> roomCounts = new java.util.HashMap<>();
        Map<Long, String>  roomImages = new java.util.HashMap<>();
        for (Long hid : hotelIds) {
            List<Room> rooms = roomRepository.findByHotelId(hid);
            roomCounts.put(hid, rooms.size());
            rooms.stream()
                 .filter(r -> r.getImageUrl() != null && !r.getImageUrl().trim().isEmpty())
                 .findFirst()
                 .ifPresent(r -> roomImages.put(hid, r.getImageUrl()));
        }

        return hotels.stream()
                .map(h -> mapToResponse(h, 
                    avgRatings.getOrDefault(h.getId(), 0.0), 
                    reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                    priceRanges.get(h.getId()),
                    roomCounts.getOrDefault(h.getId(), 0),
                    roomImages.get(h.getId())))
                .toList();
    }

    // ── Get Hotels By Status ──────────────────────────
    public List<AdminHotelResponse> getHotelsByStatus(String status) {
        List<Hotel> hotels = hotelRepository.findByApplicationStatus(status);
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);

        // Build room counts and room image fallbacks
        Map<Long, Integer> roomCounts = new java.util.HashMap<>();
        Map<Long, String>  roomImages = new java.util.HashMap<>();
        for (Long hid : hotelIds) {
            List<Room> rooms = roomRepository.findByHotelId(hid);
            roomCounts.put(hid, rooms.size());
            rooms.stream()
                 .filter(r -> r.getImageUrl() != null && !r.getImageUrl().trim().isEmpty())
                 .findFirst()
                 .ifPresent(r -> roomImages.put(hid, r.getImageUrl()));
        }

        return hotels.stream()
                .map(h -> mapToResponse(h,
                        avgRatings.getOrDefault(h.getId(), 0.0),
                        reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                        priceRanges.get(h.getId()),
                        roomCounts.getOrDefault(h.getId(), 0),
                        roomImages.get(h.getId())))
                .toList();
    }

    // ── Get Hotel Detail ──────────────────────────────
    public AdminHotelDetailResponse getHotelDetail(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        List<Room> rooms = roomRepository.findByHotelId(id);
        List<AdminHotelDetailResponse.RoomDetailResponse> roomDetails = rooms.stream()
                .map(r -> new AdminHotelDetailResponse.RoomDetailResponse(
                        r.getId(),
                        r.getName(),
                        r.getType(),
                        r.getPrice(),
                        r.getDescription(),
                        r.getImageUrl(),
                        r.getAvailability()
                ))
                .toList();

        List<Amenity> amenityEntities = amenityRepository.findByHotelId(id);
        List<String> amenities;
        if (!amenityEntities.isEmpty()) {
            amenities = amenityEntities.stream().map(Amenity::getName).toList();
        } else if (hotel.getAmenityList() != null && !hotel.getAmenityList().isEmpty()) {
            amenities = hotel.getAmenityList().stream().map(Amenity::getName).toList();
        } else {
            amenities = List.of();
        }

        Double avgRating = reviewRepository.getAverageRatingByHotelId(id);
        Long reviewCount = reviewRepository.getReviewCountByHotelId(id);

        PriceRange priceRange = hotelPricingService.getPriceRangeByHotelId(id);
        Double pFrom = (priceRange != null && priceRange.priceFrom() != null) ? priceRange.priceFrom() : hotel.getPriceFrom();
        Double pTo = (priceRange != null && priceRange.priceTo() != null) ? priceRange.priceTo() : hotel.getPriceTo();

        if ((pFrom == null || pFrom <= 0) && !rooms.isEmpty()) {
            pFrom = rooms.stream()
                         .filter(r -> r.getPrice() != null && r.getPrice() > 0)
                         .mapToDouble(Room::getPrice)
                         .min()
                         .orElse(0.0);
            if (pFrom == 0.0) pFrom = null;
        }
        if ((pTo == null || pTo <= 0) && !rooms.isEmpty()) {
            pTo = rooms.stream()
                       .filter(r -> r.getPrice() != null && r.getPrice() > 0)
                       .mapToDouble(Room::getPrice)
                       .max()
                       .orElse(0.0);
            if (pTo == 0.0) pTo = null;
        }

        List<String> dbImages = hotelRepository.findImageUrlsByHotelId(id);
        List<String> images = new ArrayList<>();
        if (dbImages != null && !dbImages.isEmpty()) {
            images.addAll(dbImages);
        }
        if (hotel.getImageUrl() != null && !hotel.getImageUrl().trim().isEmpty() && !images.contains(hotel.getImageUrl())) {
            images.add(0, hotel.getImageUrl());
        }
        for (Room r : rooms) {
            if (r.getImageUrl() != null && !r.getImageUrl().trim().isEmpty() && !images.contains(r.getImageUrl())) {
                images.add(r.getImageUrl());
            }
        }

        User owner = hotel.getOwner();
        String ownerName = owner != null ? owner.getName() : hotel.getOwnerName();
        String ownerEmail = owner != null ? owner.getEmail() : hotel.getOwnerEmail();
        String ownerNic = owner != null ? owner.getNicNumber() : hotel.getOwnerNic();
        String nicImage = owner != null ? owner.getNicImage() : hotel.getNicImageUrl();

        return new AdminHotelDetailResponse(
                hotel.getId(),
                hotel.getHotelName(),
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                reviewCount != null ? reviewCount.intValue() : 0,
                getEffectiveImageUrl(hotel, rooms),
                images,
                pFrom,
                pTo,
                hotel.getDistrict(),
                hotel.getDestination(),
                hotel.getLocation(),
                hotel.getDescription(),
                rooms.size(),
                roomDetails,
                ownerName,
                ownerEmail,
                ownerNic,
                nicImage,
                hotel.getNicRearImageUrl(),
                hotel.getBusinessRegistrationImageUrl(),
                hotel.getOwnerId(),
                hotel.getPhoneNumber(),
                hotel.getHotlineNumber(),
                hotel.getHotelEmail(),
                hotel.getHotelContactNumber(),
                amenities,
                hotel.getApplicationStatus(),
                hotel.getRejectionReason(),
                hotel.getIsActive()
        );
    }

    // ── Approve Hotel ─────────────────────────────────
    @Transactional
    public AdminHotelDetailResponse approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotel.setApplicationStatus("Approved");
        hotel.setIsActive(true);
        hotelRepository.save(hotel);

        User owner = hotel.getOwner();
        if (owner != null) {
            owner.setStatus("ACTIVE");
            owner.setIsActive(true);
            userRepository.save(owner);
        }

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "APPROVED"));

        return getHotelDetail(id);
    }

    // ── Reject Hotel ──────────────────────────────────
    @Transactional
    public AdminHotelDetailResponse rejectHotel(Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotel.setApplicationStatus("Rejected");
        hotel.setRejectionReason(reason);
        hotelRepository.save(hotel);

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "REJECTED", reason));

        return getHotelDetail(id);
    }

    // ── Toggle Active ─────────────────────────────────
    @Transactional
    public AdminHotelDetailResponse toggleActive(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        boolean newActive = !Boolean.TRUE.equals(hotel.getIsActive());
        hotel.setIsActive(newActive);
        hotelRepository.save(hotel);
        return getHotelDetail(id);
    }

    // ── Delete Hotel ──────────────────────────────────
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "DELETED", "Removed by admin"));

        hotelRepository.deleteById(id);
    }

    // ── Map Entity → Response ─────────────────────────
    private AdminHotelResponse mapToResponse(Hotel h, double rating, int reviewCount, PriceRange priceRange, int numberOfRooms, String fallbackImageUrl) {
        // Use hotel-level imageUrl first; fall back to first room image
        String img = (h.getImageUrl() != null && !h.getImageUrl().trim().isEmpty())
                ? h.getImageUrl()
                : fallbackImageUrl;
        return new AdminHotelResponse(
                h.getId(),
                h.getHotelName(),
                h.getDestination(),
                h.getLocation(),
                h.getDescription(),
                priceRange != null ? priceRange.priceFrom() : null,
                priceRange != null ? priceRange.priceTo() : null,
                Math.round(rating * 10.0) / 10.0,
                reviewCount,
                img,
                h.getDistrict(),
                h.getApplicationStatus(),
                numberOfRooms
        );
    }

    // Used only for detail view — rooms list is explicitly fetched, no lazy issue
    private String getEffectiveImageUrl(Hotel h, List<Room> fetchedRooms) {
        String img = h.getImageUrl();
        if (img != null && !img.trim().isEmpty()) {
            return img;
        }
        if (fetchedRooms != null) {
            for (Room r : fetchedRooms) {
                if (r.getImageUrl() != null && !r.getImageUrl().trim().isEmpty()) {
                    return r.getImageUrl();
                }
            }
        }
        return null;
    }
}