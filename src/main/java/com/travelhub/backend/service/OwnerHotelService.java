package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
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

    public List<HotelResponse> getOwnerHotels(String status) {
        // Fetch all hotels matching the status (Global View)
        // Ensure the status matches the database values: "Approved", "Pending", "Rejected"
        String targetStatus = "Approved"; // Default to Approved
        
        if ("Pending".equalsIgnoreCase(status)) {
            targetStatus = "Pending";
        } else if ("Rejected".equalsIgnoreCase(status)) {
            targetStatus = "Rejected";
        } else if ("Approved".equalsIgnoreCase(status)) {
            targetStatus = "Approved";
        }

        return hotelRepository.findByApplicationStatus(targetStatus).stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HotelResponse createHotel(OwnerHotelRequest request, MultipartFile hotelImage, String email) {
        User owner = (email != null && !email.isBlank())
                ? userRepository.findByEmail(email).orElse(null)
                : null;

        String imageUrl = request.getImageUrl();
        if (hotelImage != null && !hotelImage.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
            } catch (Exception e) {
                System.err.println("Warning: Hotel image upload failed: " + e.getMessage());
                // Fallback to placeholder if upload fails
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
                .ownerEmail(email)
                .ownerNic(request.getOwnerNic())
                .applicationStatus("Pending")
                .owner(owner)
                .build();

        hotel = hotelRepository.save(hotel);
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "CREATED"));
        return toHotelResponse(hotel);
    }

    @Transactional
    public HotelResponse updateHotel(Long id, OwnerHotelRequest request, MultipartFile hotelImage) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

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
        hotel.setHotlineNumber(request.getHotlineNumber());
        hotel.setOwnerName(request.getOwnerName());
        hotel.setHotelEmail(request.getOwnerEmail());
        hotel.setOwnerNic(request.getOwnerNic());

        hotel = hotelRepository.save(hotel);
        return toHotelResponse(hotel);
    }

    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
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
                .applicationStatus(hotel.getApplicationStatus())
                .isActive(hotel.getIsActive() != null ? hotel.getIsActive() : true)
                .hotelEmail(hotel.getHotelEmail())
                .hotelContactNumber(hotel.getHotelContactNumber())
                .build();
    }
}
