package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.event.HotelEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
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
        // Fetch all hotels matching the status (Global View requirement)
        String targetStatus = "Pending";
        if ("Approved".equalsIgnoreCase(status)) targetStatus = "Approved";
        if ("Rejected".equalsIgnoreCase(status)) targetStatus = "Rejected";
        
        return hotelRepository.findByApplicationStatus(targetStatus).stream()
                .map(this::toHotelResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HotelResponse createHotel(OwnerHotelRequest request, MultipartFile hotelImage, String email) {
        // owner_id is optional — link the hotel to the logged-in user if found,
        // otherwise leave owner as null. It can be associated later via Profile Settings.
        User owner = (email != null && !email.isBlank())
                ? userRepository.findByEmail(email).orElse(null)
                : null;

        String imageUrl = request.getImageUrl();
        if (hotelImage != null && !hotelImage.isEmpty()) {
            imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
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
                .hotelEmail(request.getOwnerEmail()) // Form email = Hotel Email
                .hotelContactNumber(request.getPhoneNumber()) // Form phone = Hotel Contact
                .phoneNumber(request.getPhoneNumber())
                .hotlineNumber(request.getHotlineNumber())
                .ownerName(request.getOwnerName())
                // Always store the JWT principal email for account identification/visibility
                .ownerEmail(email) 
                .ownerNic(request.getOwnerNic())
                .applicationStatus("Pending")
                .owner(owner) // nullable — linked only if authenticated user exists
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
            imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
            hotel.setImageUrl(imageUrl);
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
        // hotel.setOwnerEmail(request.getOwnerEmail()); // Ownership should not be changed via form
        hotel.setHotelEmail(request.getOwnerEmail()); // The form email is the hotel contact email
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
                .hotelEmail(hotel.getHotelEmail())
                .hotelContactNumber(hotel.getHotelContactNumber())
                .build();
    }
}
