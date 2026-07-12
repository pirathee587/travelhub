package com.travelhub.backend.service;

import com.travelhub.backend.common.ForbiddenException;
import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.OwnerHotelSummaryResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.repository.HotelImageRepository;
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
    private final HotelImageRepository hotelImageRepository;
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
    public HotelResponse createHotel(OwnerHotelRequest request, MultipartFile hotelImage, Long ownerId, List<MultipartFile> uploadedImages) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + ownerId));

        String imageUrl = request.getImageUrl();
        List<MultipartFile> files = uploadedImages != null ? uploadedImages : List.of();
        if (files.isEmpty() && hotelImage != null && !hotelImage.isEmpty()) {
            files = List.of(hotelImage);
        }

        if (files.size() < 3) {
            throw new IllegalArgumentException("Minimum 3 hotel images are required.");
        }

        if (!files.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(files.get(0)).getImageUrl();
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
                .owner(owner)
                .build();

        hotel = hotelRepository.save(hotel);

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (file == null || file.isEmpty()) {
                continue;
            }
            try {
                String uploadedUrl = imageUploadService.uploadHotelImage(file).getImageUrl();
                hotelImageRepository.save(
                        com.travelhub.backend.entity.HotelImage.builder()
                                .hotel(hotel)
                                .imageUrl(uploadedUrl)
                                .displayOrder(i + 1)
                                .originalFileName(file.getOriginalFilename())
                                .build());
            } catch (Exception e) {
                System.err.println("Warning: Failed to save hotel image record for " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        eventPublisher.publishEvent(new HotelEvent(this, hotel, "CREATED"));
        return toHotelResponse(hotel);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, OwnerHotelRequest request, MultipartFile hotelImage, Long ownerId, List<MultipartFile> uploadedImages) {
        Hotel hotel = getOwnedHotel(id, ownerId);

        String imageUrl = request.getImageUrl();
        List<MultipartFile> files = uploadedImages != null ? uploadedImages : List.of();
        if (files.isEmpty() && hotelImage != null && !hotelImage.isEmpty()) {
            files = List.of(hotelImage);
        }

        if (!files.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(files.get(0)).getImageUrl();
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
        hotel.setHotlineNumber(request.getHotlineNumber());
        hotel.setOwnerName(request.getOwnerName());
        hotel.setHotelEmail(request.getOwnerEmail());
        hotel.setOwnerNic(request.getOwnerNic());

        hotel = hotelRepository.save(hotel);

        if (!files.isEmpty()) {
            int existingCount = hotelImageRepository.findByHotelIdOrdered(hotel.getId()).size();
            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                if (file == null || file.isEmpty()) {
                    continue;
                }
                try {
                    String uploadedUrl = imageUploadService.uploadHotelImage(file).getImageUrl();
                    hotelImageRepository.save(
                            com.travelhub.backend.entity.HotelImage.builder()
                                    .hotel(hotel)
                                    .imageUrl(uploadedUrl)
                                    .displayOrder(existingCount + i + 1)
                                    .originalFileName(file.getOriginalFilename())
                                    .build());
                } catch (Exception e) {
                    System.err.println("Warning: Failed to save hotel image record on update for " + file.getOriginalFilename() + ": " + e.getMessage());
                }
            }
        }

        return toHotelResponse(hotel);
    }

    @Transactional
    public void deleteHotel(Long id, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);
        hotelRepository.delete(hotel);
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

        List<String> images = hotelImageRepository.findByHotelIdOrdered(hotel.getId()).stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());

        if (images.isEmpty() && hotel.getImageUrl() != null) {
            images = List.of(hotel.getImageUrl());
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
                .images(images)
                .amenities(amenityList)
                .district(hotel.getDistrict())
                .applicationStatus(hotel.getApplicationStatus())
                .isActive(hotel.getIsActive() != null ? hotel.getIsActive() : true)
                .hotelEmail(hotel.getHotelEmail())
                .hotelContactNumber(hotel.getHotelContactNumber())
                .build();
    }
}
