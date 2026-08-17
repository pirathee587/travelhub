package com.travelhub.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.backend.common.BadRequestException;
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

import jakarta.persistence.EntityManager;
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
    private final EntityManager              entityManager;

    // ── Count Active Bookings for a Hotel ─────────────
    public long countActiveBookings(Long hotelId) {
        Number count = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(DISTINCT b.id) FROM bookings b " +
                "LEFT JOIN booking_hotel_preferences bhp ON bhp.booking_id = b.id " +
                "WHERE (b.hotel_id = :hotelId OR bhp.hotel_id = :hotelId) " +
                "AND LOWER(b.status) NOT IN ('cancelled', 'rejected', 'completed')"
        ).setParameter("hotelId", hotelId).getSingleResult();

        return count != null ? count.longValue() : 0L;
    }

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

        Map<Long, Long> activeBookingsMap = fetchActiveBookingsMap(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h, 
                    avgRatings.getOrDefault(h.getId(), 0.0), 
                    reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                    priceRanges.get(h.getId()),
                    roomCounts.getOrDefault(h.getId(), 0),
                    roomImages.get(h.getId()),
                    activeBookingsMap.getOrDefault(h.getId(), 0L)))
                .toList();
    }

    // ── Get Hotels By Status ──────────────────────────
    public List<AdminHotelResponse> getHotelsByStatus(String status) {
        List<Hotel> hotels;
        if ("Suspended".equalsIgnoreCase(status)) {
            hotels = hotelRepository.findAll().stream()
                    .filter(h -> "Suspended".equalsIgnoreCase(h.getApplicationStatus()) || Boolean.FALSE.equals(h.getIsActive()))
                    .toList();
        } else if ("Approved".equalsIgnoreCase(status)) {
            hotels = hotelRepository.findAll().stream()
                    .filter(h -> ("Approved".equalsIgnoreCase(h.getApplicationStatus()) || "Active".equalsIgnoreCase(h.getApplicationStatus()))
                            && !Boolean.FALSE.equals(h.getIsActive()))
                    .toList();
        } else {
            hotels = hotelRepository.findByApplicationStatus(status);
            if (hotels.isEmpty()) {
                hotels = hotelRepository.findAll().stream()
                        .filter(h -> status.equalsIgnoreCase(h.getApplicationStatus()))
                        .toList();
            }
        }
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

        Map<Long, Long> activeBookingsMap = fetchActiveBookingsMap(hotelIds);

        return hotels.stream()
                .map(h -> mapToResponse(h,
                        avgRatings.getOrDefault(h.getId(), 0.0),
                        reviewCounts.getOrDefault(h.getId(), 0L).intValue(),
                        priceRanges.get(h.getId()),
                        roomCounts.getOrDefault(h.getId(), 0),
                        roomImages.get(h.getId()),
                        activeBookingsMap.getOrDefault(h.getId(), 0L)))
                .toList();
    }

    private Map<Long, Long> fetchActiveBookingsMap(List<Long> hotelIds) {
        Map<Long, Long> activeBookingsMap = new java.util.HashMap<>();
        if (!hotelIds.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT COALESCE(b.hotel_id, bhp.hotel_id) AS hid, COUNT(DISTINCT b.id) " +
                "FROM bookings b " +
                "LEFT JOIN booking_hotel_preferences bhp ON bhp.booking_id = b.id " +
                "WHERE (b.hotel_id IN :hotelIds OR bhp.hotel_id IN :hotelIds) " +
                "AND LOWER(b.status) NOT IN ('cancelled', 'rejected', 'completed') " +
                "GROUP BY COALESCE(b.hotel_id, bhp.hotel_id)"
            ).setParameter("hotelIds", hotelIds).getResultList();

            for (Object[] row : rows) {
                if (row[0] != null && row[1] != null) {
                    activeBookingsMap.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
                }
            }
        }
        return activeBookingsMap;
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

        long activeBookings = countActiveBookings(id);

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
                hotel.getIsActive(),
                activeBookings
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
        hotel.setIsActive(false);
        hotelRepository.save(hotel);

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "REJECTED", reason));

        return getHotelDetail(id);
    }

    // ── Toggle Active (Activate / Suspend) ─────────────
    @Transactional
    public AdminHotelDetailResponse toggleActive(Long id) {
        return toggleActive(id, null);
    }

    @Transactional
    public AdminHotelDetailResponse toggleActive(Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));
        boolean newActive = !Boolean.TRUE.equals(hotel.getIsActive());

        if (!newActive) {
            // Cannot suspend if active bookings exist
            long activeBookings = countActiveBookings(id);
            if (activeBookings > 0) {
                throw new BadRequestException(
                        "Cannot suspend hotel: This hotel currently has " + activeBookings
                        + " active booking(s). Hotels with active bookings cannot be suspended."
                );
            }
            if (reason != null && !reason.trim().isEmpty()) {
                hotel.setRejectionReason(reason);
            }
            hotel.setIsActive(false);
            hotel.setApplicationStatus("Suspended");
            hotelRepository.save(hotel);
            eventPublisher.publishEvent(new HotelEvent(this, hotel, "SUSPENDED", reason));
        } else {
            hotel.setIsActive(true);
            hotel.setApplicationStatus("Approved");
            hotel.setRejectionReason(null);
            hotelRepository.save(hotel);
            eventPublisher.publishEvent(new HotelEvent(this, hotel, "ACTIVATED", null));
        }

        return getHotelDetail(id);
    }

    // ── Delete Hotel ──────────────────────────────────
    @Transactional
    public void deleteHotel(Long id) {
        deleteHotel(id, null);
    }

    @Transactional
    public void deleteHotel(Long id, String reason) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", id));

        // Cannot delete if active bookings exist
        long activeBookings = countActiveBookings(id);
        if (activeBookings > 0) {
            throw new BadRequestException(
                    "Cannot delete hotel: This hotel currently has " + activeBookings
                    + " active booking(s). Hotels with active bookings cannot be deleted."
            );
        }

        String effectiveReason = (reason != null && !reason.trim().isEmpty()) ? reason : "Removed by admin";
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "DELETED", effectiveReason));

        // Clean up unlinked completed/cancelled bookings and child records
        entityManager.createNativeQuery("UPDATE bookings SET hotel_id = NULL WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM booking_hotel_preferences WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM hotel_images WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reviews WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM room_amenities WHERE room_id IN (SELECT id FROM rooms WHERE hotel_id = :id)")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM rooms WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM hotel_amenities WHERE hotel_id = :id")
                .setParameter("id", id).executeUpdate();

        hotelRepository.deleteById(id);
    }

    // ── Map Entity → Response ─────────────────────────
    private AdminHotelResponse mapToResponse(Hotel h, double rating, int reviewCount, PriceRange priceRange, int numberOfRooms, String fallbackImageUrl, Long activeBookingsCount) {
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
                numberOfRooms,
                h.getIsActive(),
                h.getRejectionReason(),
                activeBookingsCount
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