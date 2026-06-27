package com.travelhub.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminHotelDetailResponse;
import com.travelhub.backend.dto.response.AdminHotelResponse;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelImageRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.HotelPricingService.PriceRange;

import org.springframework.transaction.annotation.Transactional;

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
    private final HotelImageRepository       hotelImageRepository;
    private final ApplicationEventPublisher  eventPublisher;

    // ── Get All Hotels ────────────────────────────────
    public List<AdminHotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);
        Map<Long, String> hotelImages = getFirstHotelImagesByHotelIds(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h,
                    avgRatings.getOrDefault(h.getId(), 0.0),
                                        reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                                        priceRanges.get(h.getId()),
                                        hotelImages.get(h.getId())))
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
        Map<Long, String> hotelImages = getFirstHotelImagesByHotelIds(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h,
                        avgRatings.getOrDefault(h.getId(), 0.0),
                        reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                        priceRanges.get(h.getId()),
                        hotelImages.get(h.getId())))
                .toList();
    }

    // ── Get Hotel Detail ──────────────────────────────
    public AdminHotelDetailResponse getHotelDetail(
            Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));

        List<Room> rooms = roomRepository.findByHotelId(id);
        List<AdminHotelDetailResponse.RoomTypeResponse>
                roomTypes = rooms.stream()
                .map(r -> new AdminHotelDetailResponse
                        .RoomTypeResponse(
                        r.getName(),
                        r.getDescription()))
                .toList();

        List<Amenity> amenityEntities =
                amenityRepository.findByHotelId(id);
        List<String> amenities;
        if (!amenityEntities.isEmpty()) {
            amenities = amenityEntities.stream()
                    .map(Amenity::getName).toList();
        } else if (hotel.getAmenityList() != null
                && !hotel.getAmenityList().isEmpty()) {
            amenities = hotel.getAmenityList().stream()
                    .map(Amenity::getName).toList();
        } else {
            amenities = List.of();
        }

        Double avgRating = reviewRepository.getAverageRatingByHotelId(id);
        
        // Fetch owner from UserRepository by hotelId, or from the hotel's owner relationship
        User owner = hotel.getOwner();
        if (owner == null) {
            owner = userRepository.findByHotelId(id).orElse(null);
        }

        String ownerName = owner != null ? owner.getName() : hotel.getOwnerName();
        String ownerEmail = owner != null ? owner.getEmail() : hotel.getOwnerEmail();
        String ownerNic = owner != null ? owner.getNicNumber() : hotel.getOwnerNic();
        String nicImageUrl = owner != null ? owner.getNicImage() : hotel.getNicImageUrl();
        Long ownerId = owner != null ? owner.getId() : hotel.getOwnerId();

        String phoneNumber = hotel.getPhoneNumber() != null ? hotel.getPhoneNumber() : (owner != null ? owner.getTelephone() : null);
        String hotelEmail = hotel.getHotelEmail() != null ? hotel.getHotelEmail() : (owner != null ? owner.getEmail() : null);

        // Resolve image: hotel.imageUrl → hotel_images table → generic placeholder
        String imageUrl;
        if (hotel.getImageUrl() != null && !hotel.getImageUrl().isBlank()) {
            imageUrl = hotel.getImageUrl();
        } else {
            imageUrl = hotelImageRepository.findFirstImageUrlByHotelId(id)
                    .orElse("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop");
        }

        return new AdminHotelDetailResponse(
                hotel.getId(),
                hotel.getHotelName(),
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                imageUrl,
                hotel.getDistrict(),
                hotel.getLocation(),
                hotel.getNumberOfRooms(),
                roomTypes,
                ownerName,
                ownerEmail,
                ownerNic,
                nicImageUrl,
                ownerId,
                phoneNumber,
                hotel.getHotlineNumber(),
                hotelEmail,
                hotel.getHotelContactNumber(),
                amenities,
                hotel.getApplicationStatus(),
                hotel.getIsActive() != null ? hotel.getIsActive() : true
        );
    }

    // ── Toggle Active (Suspend / Activate) ────────────
    @Transactional
    public AdminHotelDetailResponse toggleActive(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));

        boolean newActiveState = hotel.getIsActive() == null || !hotel.getIsActive();
        hotel.setIsActive(newActiveState);
        hotelRepository.save(hotel);

        // Directly UPDATE the hotel owner's is_active in users table
        // The query filters by u.hotelId which stores the hotel's own ID, so always pass `id` (hotel ID)
        userRepository.updateIsActiveByHotelId(id, newActiveState);

        // Fire SUSPENDED event when a hotel is being suspended (active → inactive)
        if (!newActiveState) {
            eventPublisher.publishEvent(new HotelEvent(this, hotel, "SUSPENDED"));
        }

        return getHotelDetail(id);
    }


    // ── Approve Hotel ─────────────────────────────────
    @Transactional
    public AdminHotelDetailResponse approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotel.setApplicationStatus("Approved");
        hotelRepository.save(hotel);


        eventPublisher.publishEvent(
                new HotelEvent(this, hotel, "APPROVED"));

        return getHotelDetail(id);
    }

    // ── Reject Hotel ──────────────────────────────────
    @Transactional
    public AdminHotelDetailResponse rejectHotel(
            Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotel.setApplicationStatus("Rejected");
        hotelRepository.save(hotel);


        eventPublisher.publishEvent(
                new HotelEvent(
                        this, hotel, "REJECTED", reason));

        return getHotelDetail(id);
    }

    // ── Delete Hotel ──────────────────────────────────
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));


        eventPublisher.publishEvent(
                new HotelEvent(
                        this, hotel, "DELETED",
                        "Removed by admin"));

        hotelRepository.deleteById(id);
    }

    // ── Map Entity → Response ─────────────────────────
    private AdminHotelResponse mapToResponse(Hotel h, double rating, int reviewCount, PriceRange priceRange, String roomImageUrl) {
        // Resolve image: hotel.imageUrl → room image → generic placeholder
        String imageUrl;
        if (h.getImageUrl() != null && !h.getImageUrl().isBlank()) {
            imageUrl = h.getImageUrl();
        } else if (roomImageUrl != null && !roomImageUrl.isBlank()) {
            imageUrl = roomImageUrl;
        } else {
            imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
        }
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
                imageUrl,
                h.getDistrict(),
                h.getNumberOfRooms(),
                h.getApplicationStatus(),
                h.getIsActive() != null ? h.getIsActive() : true
        );
    }

    // ── Batch-fetch first hotel image per hotel ───────
    private Map<Long, String> getFirstHotelImagesByHotelIds(List<Long> hotelIds) {
        List<Object[]> rows = hotelImageRepository.findFirstImageUrlsByHotelIds(hotelIds);
        Map<Long, String> result = new java.util.HashMap<>();
        for (Object[] row : rows) {
            Long hotelId = ((Number) row[0]).longValue();
            String imgUrl = (String) row[1];
            // putIfAbsent keeps only the first (lowest displayOrder/id) per hotel
            result.putIfAbsent(hotelId, imgUrl);
        }
        return result;
    }
}