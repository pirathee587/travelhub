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
import java.util.ArrayList;
import java.util.stream.Collectors;
import com.travelhub.backend.entity.HotelImage;

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
    public HotelResponse createHotel(OwnerHotelRequest request, List<MultipartFile> hotelImages, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found with id: " + ownerId));

        List<HotelImage> imagesToSave = new ArrayList<>();
        if (hotelImages != null && !hotelImages.isEmpty()) {
            int displayOrder = 0;
            for (MultipartFile file : hotelImages) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String uploadedUrl = imageUploadService.uploadHotelImage(file).getImageUrl();
                        HotelImage hi = HotelImage.builder()
                                .imageUrl(uploadedUrl)
                                .displayOrder(displayOrder++)
                                .originalFileName(file.getOriginalFilename())
                                .build();
                        imagesToSave.add(hi);
                    } catch (Exception e) {
                        System.err.println("Warning: Hotel image upload failed: " + e.getMessage());
                    }
                }
            }
        }
        
        if (imagesToSave.isEmpty()) {
             HotelImage placeholder = HotelImage.builder()
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop")
                    .displayOrder(0)
                    .originalFileName("placeholder")
                    .build();
             imagesToSave.add(placeholder);
        }

        Hotel hotel = Hotel.builder()
                .hotelName(request.getHotelName())
                .destination(request.getDestination())
                .location(request.getLocation())
                .description(request.getDescription())
                .priceFrom(request.getPriceFrom())
                .priceTo(request.getPriceTo())
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
                .hotelImages(new ArrayList<>())
                .build();
                
        for (HotelImage hi : imagesToSave) {
            hi.setHotel(hotel);
            hotel.getHotelImages().add(hi);
        }

        hotel = hotelRepository.save(hotel);
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "CREATED"));
        return toHotelResponse(hotel);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, OwnerHotelRequest request, List<MultipartFile> hotelImages, Long ownerId) {
        Hotel hotel = getOwnedHotel(id, ownerId);

        List<HotelImage> imagesToSave = new ArrayList<>();
        int displayOrder = 0;

        // 1. Process existing images that the user wants to keep
        if (request.getExistingImages() != null && !request.getExistingImages().isEmpty()) {
            for (String existingUrl : request.getExistingImages()) {
                HotelImage hi = HotelImage.builder()
                        .hotel(hotel)
                        .imageUrl(existingUrl)
                        .displayOrder(displayOrder++)
                        .originalFileName("existing_image")
                        .build();
                imagesToSave.add(hi);
            }
        }

        // 2. Process newly uploaded images
        if (hotelImages != null && !hotelImages.isEmpty()) {
            for (MultipartFile file : hotelImages) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String uploadedUrl = imageUploadService.uploadHotelImage(file).getImageUrl();
                        HotelImage hi = HotelImage.builder()
                                .hotel(hotel)
                                .imageUrl(uploadedUrl)
                                .displayOrder(displayOrder++)
                                .originalFileName(file.getOriginalFilename())
                                .build();
                        imagesToSave.add(hi);
                    } catch (Exception e) {
                        System.err.println("Warning: Hotel image upload failed: " + e.getMessage());
                    }
                }
            }
        }

        // Fallback: if user removed all images and uploaded none, keep a placeholder
        if (imagesToSave.isEmpty()) {
            HotelImage placeholder = HotelImage.builder()
                    .hotel(hotel)
                    .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop")
                    .displayOrder(0)
                    .originalFileName("placeholder")
                    .build();
            imagesToSave.add(placeholder);
        }

        // Clear existing collection and add new items to let Hibernate manage the orphans
        if (hotel.getHotelImages() != null) {
            hotel.getHotelImages().clear();
        } else {
            hotel.setHotelImages(new ArrayList<>());
        }

        for (HotelImage hi : imagesToSave) {
            hotel.getHotelImages().add(hi);
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
                
        List<String> images = (hotel.getHotelImages() != null)
                ? hotel.getHotelImages().stream()
                    .map(HotelImage::getImageUrl)
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
                .images(images)
                .amenities(amenityList)
                .district(hotel.getDistrict())
                .applicationStatus(hotel.getApplicationStatus())
                .hotelEmail(hotel.getHotelEmail())
                .hotelContactNumber(hotel.getHotelContactNumber())
                .build();
    }
}
