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
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.AmenityRepository;
import org.springframework.transaction.annotation.Transactional;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.RoomRepository;
import com.travelhub.backend.service.HotelPricingService.PriceRange;

/**
 * AdminHotelService manages the administrative lifecycle of hotels on the platform.
 * It handles the review and approval of hotel registrations, property details oversight, and status transitions.
 */
@Service
public class AdminHotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final ReviewRepository reviewRepository;
    private final HotelPricingService hotelPricingService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Constructor injection for repositories, pricing utilities, and event publishing.
     */
    public AdminHotelService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            AmenityRepository amenityRepository,
            ReviewRepository reviewRepository,
            HotelPricingService hotelPricingService,
            ApplicationEventPublisher eventPublisher) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.amenityRepository = amenityRepository;
        this.reviewRepository = reviewRepository;
        this.hotelPricingService = hotelPricingService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Retrieves all registered hotels.
     * Uses optimized batch lookups for ratings, review counts, and price ranges to avoid N+1 issues.
     */
    public List<AdminHotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        // Fetch stats in bulk
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h, 
                    avgRatings.getOrDefault(h.getId(), 0.0), 
                    reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                    priceRanges.get(h.getId())))
                .toList();
    }

    /**
     * Retrieves hotels filtered by their current application status (e.g., "Pending").
     */
    public List<AdminHotelResponse> getHotelsByStatus(String status) {
        List<Hotel> hotels = hotelRepository.findByApplicationStatus(status);
        if (hotels.isEmpty()) return List.of();

        List<Long> hotelIds = hotels.stream().map(Hotel::getId).toList();
        Map<Long, Double> avgRatings = reviewRepository.getAverageRatingsByHotelIds(hotelIds);
        Map<Long, Long> reviewCounts = reviewRepository.getReviewCountsByHotelIds(hotelIds);
        Map<Long, PriceRange> priceRanges = hotelPricingService.getPriceRangesByHotelIds(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h,
                        avgRatings.getOrDefault(h.getId(), 0.0),
                        reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                        priceRanges.get(h.getId())))
                .toList();
    }

    /**
     * Retrieves full, detailed information for a specific hotel for in-depth administrative review.
     * Includes owner details, NIC images, and room type breakdowns.
     */
    public AdminHotelDetailResponse getHotelDetail(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        // Fetch associated room types for descriptive summary
        List<Room> rooms = roomRepository.findByHotelId(id);
        List<AdminHotelDetailResponse.RoomTypeResponse> roomTypes = rooms.stream()
                .map(r -> new AdminHotelDetailResponse.RoomTypeResponse(r.getName(), r.getDescription()))
                .toList();

        // Consolidate amenities from both direct repository and entity relationship (legacy support)
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
        
        return new AdminHotelDetailResponse(
                hotel.getId(),
                hotel.getHotelName(),
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                hotel.getImageUrl(),
                hotel.getDistrict(),
                hotel.getLocation(),
                roomTypes,
                hotel.getOwnerName(),
                hotel.getOwnerEmail(),
                hotel.getOwnerNic(),
                hotel.getNicImageUrl(),
                hotel.getOwnerId(),
                hotel.getPhoneNumber(),
                hotel.getHotlineNumber(),
                hotel.getHotelEmail(),
                hotel.getHotelContactNumber(),
                amenities,
                hotel.getApplicationStatus()
        );
    }

    /**
     * Approves a hotel's registration, making it visible to public tourists.
     * Triggers a 'APPROVED' notification event for the hotel owner.
     */
    @Transactional
    public AdminHotelDetailResponse approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotel.setApplicationStatus("Approved");
        
        // Synchronize with the owner's User account for login access
        if (hotel.getOwner() != null) {
            hotel.getOwner().setAgentApproved(true);
            hotel.getOwner().setStatus("ACTIVE");
            // Trigger account approval notification
            eventPublisher.publishEvent(new UserAccountEvent(this, hotel.getOwner(), "APPROVED"));
        }

        hotelRepository.save(hotel);

        // Notify stakeholders via system events (Hotel-specific notification)
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "APPROVED"));

        return getHotelDetail(id);
    }

    /**
     * Rejects a hotel's registration with a specific reason.
     * Triggers a 'REJECTED' notification event including the reason.
     */
    @Transactional
    public AdminHotelDetailResponse rejectHotel(Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        hotel.setApplicationStatus("Rejected");
        
        // Optionally keep the user pending or mark as rejected if this is their primary/first hotel
        if (hotel.getOwner() != null) {
            hotel.getOwner().setAgentApproved(false);
            hotel.getOwner().setStatus("REJECTED");
            eventPublisher.publishEvent(new UserAccountEvent(this, hotel.getOwner(), "REJECTED", reason));
        }

        hotelRepository.save(hotel);

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "REJECTED", reason));

        return getHotelDetail(id);
    }

    /**
     * Deletes a hotel and its associated data from the platform.
     * Triggers a terminal 'DELETED' event.
     */
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "DELETED", "Removed by admin"));

        hotelRepository.deleteById(id);
    }

    /**
     * Maps a Hotel entity and its calculated stats to a summary response DTO.
     */
    private AdminHotelResponse mapToResponse(Hotel h, double rating, int reviewCount, PriceRange priceRange) {
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
                h.getImageUrl(),
                h.getDistrict(),
                h.getApplicationStatus()
        );
    }
}