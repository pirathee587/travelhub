package com.travelhub.backend.service;

import com.travelhub.backend.common.ForbiddenException;
import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.OwnerHotelSummaryResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OwnerHotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ImageUploadService imageUploadService;
    private final ApplicationEventPublisher eventPublisher;

    public List<HotelResponse> getOwnerHotels(String status, Long ownerId) {
        String targetStatus = normalizeStatus(status);
        List<Hotel> hotels = hotelRepository.findByOwnerIdAndApplicationStatus(ownerId, targetStatus);

        return hotels.stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    public OwnerHotelSummaryResponse getOwnerHotelSummary(Long ownerId) {
        int approved = (int) hotelRepository.countByOwnerIdAndApplicationStatus(ownerId, "Approved");
        int pending = (int) hotelRepository.countByOwnerIdAndApplicationStatus(ownerId, "Pending");
        int rejected = (int) hotelRepository.countByOwnerIdAndApplicationStatus(ownerId, "Rejected");

        return OwnerHotelSummaryResponse.builder()
                .approved(approved)
                .pending(pending)
                .rejected(rejected)
                .total(approved + pending + rejected)
                .build();
    }

    @Transactional
    public HotelResponse createHotel(OwnerHotelRequest request, MultipartFile hotelImage, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + ownerId));

        String imageUrl = request.getImageUrl();
        if (hotelImage != null && !hotelImage.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
            } catch (Exception e) {
                System.err.println("Warning: Hotel image upload failed: " + e.getMessage());
                if (imageUrl == null || imageUrl.isBlank()) {
                    imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
                }
            }
        }

        Hotel hotel = Hotel.builder()
                .hotelName(request.getHotelName())
                .destination(request.getDestination())
                .location(request.getLocation())
                .description(request.getDescription())
                .priceFrom(request.getPriceFrom())
                .priceTo(request.getPriceTo())
                .imageUrl(imageUrl)
                .district(request.getDistrict())
                .hotelEmail(request.getOwnerEmail())
                .hotelContactNumber(request.getPhoneNumber())
                .phoneNumber(request.getPhoneNumber())
                .hotlineNumber(request.getHotlineNumber())
                .ownerName(request.getOwnerName())
                .ownerEmail(owner.getEmail())
                .ownerNic(request.getOwnerNic())
                .applicationStatus("Pending")
                .isActive(true)
                .owner(owner)
                .build();

        hotel = hotelRepository.save(hotel);
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "CREATED"));
        return toHotelResponse(hotel);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, OwnerHotelRequest request, MultipartFile hotelImage, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);

        String imageUrl = request.getImageUrl();
        if (hotelImage != null && !hotelImage.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
                hotel.setImageUrl(imageUrl);
            } catch (Exception e) {
                System.err.println("Warning: Hotel image update failed: " + e.getMessage());
            }
        }

        hotel.setHotelName(request.getHotelName());
        hotel.setDestination(request.getDestination());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
        hotel.setPriceFrom(request.getPriceFrom());
        hotel.setPriceTo(request.getPriceTo());
        hotel.setDistrict(request.getDistrict());
        hotel.setPhoneNumber(request.getPhoneNumber());
        hotel.setHotelContactNumber(request.getPhoneNumber());
        hotel.setHotlineNumber(request.getHotlineNumber());
        hotel.setOwnerName(request.getOwnerName());
        hotel.setHotelEmail(request.getOwnerEmail());
        hotel.setOwnerNic(request.getOwnerNic());

        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    @Transactional
    public void deleteHotel(Long id, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);
        hotelRepository.delete(hotel);
    }

    @Transactional
    public HotelResponse suspendHotel(Long id, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);
        hotel.setIsActive(false);
        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    @Transactional
    public HotelResponse reactivateHotel(Long id, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);
        hotel.setIsActive(true);
        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    private Hotel getOwnedHotel(Long id, Long ownerId) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

        Long hotelOwnerId = hotel.getOwnerId();
        if (hotelOwnerId == null && hotel.getOwner() != null) {
            hotelOwnerId = hotel.getOwner().getId();
        }

        if (hotelOwnerId == null || !hotelOwnerId.equals(ownerId)) {
            throw new ForbiddenException("You do not have permission to manage this hotel.");
        }

        return hotel;
    }

    private String normalizeStatus(String status) {
        if ("Pending".equalsIgnoreCase(status)) {
            return "Pending";
        }
        if ("Rejected".equalsIgnoreCase(status)) {
            return "Rejected";
        }
        return "Approved";
    }

    private HotelResponse toHotelResponse(Hotel hotel) {
        List<String> amenityList = (hotel.getAmenityList() != null)
                ? hotel.getAmenityList().stream()
                    .map(amenity -> amenity.getName())
                    .collect(Collectors.toList())
                : List.of();

        // Fetch images from hotel_images table
        List<String> imageList = hotelRepository.findImageUrlsByHotelId(hotel.getId());
        // Fall back to the single imageUrl if no rows in hotel_images
        if (imageList == null || imageList.isEmpty()) {
            String fallback = hotel.getImageUrl();
            imageList = (fallback != null && !fallback.isBlank()) ? List.of(fallback) : List.of();
        }

        return HotelResponse.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .destination(hotel.getDestination())
                .location(hotel.getLocation())
                .description(hotel.getDescription())
                .priceFrom(hotel.getPriceFrom())
                .priceTo(hotel.getPriceTo())
                .imageUrl(hotel.getImageUrl())
                .images(imageList)
                .amenities(amenityList)
                .district(hotel.getDistrict())
                .applicationStatus(hotel.getApplicationStatus())
                .isActive(hotel.getIsActive() != null ? hotel.getIsActive() : true)
                .hotelEmail(hotel.getHotelEmail())
                .hotelContactNumber(hotel.getHotelContactNumber() != null ? hotel.getHotelContactNumber() : hotel.getPhoneNumber())
                .build();
    }
}
