package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.ReviewRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class OwnerHotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ImageUploadService imageUploadService;
    private final ApplicationEventPublisher eventPublisher;

    public OwnerHotelService(
            HotelRepository hotelRepository,
            UserRepository userRepository,
            ReviewRepository reviewRepository,
            ImageUploadService imageUploadService,
            ApplicationEventPublisher eventPublisher) {
        this.hotelRepository = hotelRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.imageUploadService = imageUploadService;
        this.eventPublisher = eventPublisher;
    }

    public List<HotelResponse> getOwnerHotels(String status) {
        String targetStatus = "Approved";
        
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
                if (imageUrl == null || imageUrl.isBlank()) {
                    imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
                }
            }
        }

        Hotel hotel = new Hotel();
        hotel.setHotelName(request.getHotelName());
        hotel.setDestination(request.getDestination());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
        hotel.setPriceFrom(request.getPriceFrom());
        hotel.setPriceTo(request.getPriceTo());
        hotel.setImageUrl(imageUrl);
        hotel.setDistrict(request.getDistrict());
        hotel.setHotelEmail(request.getOwnerEmail());
        hotel.setHotelContactNumber(request.getPhoneNumber());
        hotel.setPhoneNumber(request.getPhoneNumber());
        hotel.setHotlineNumber(request.getHotlineNumber());
        hotel.setOwnerName(request.getOwnerName());
        hotel.setOwnerEmail(email);
        hotel.setOwnerNic(request.getOwnerNic());
        hotel.setApplicationStatus("Pending");
        hotel.setOwner(owner);

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

        HotelResponse response = new HotelResponse();
        response.setId(hotel.getId());
        response.setHotelName(hotel.getHotelName());
        response.setDestination(hotel.getDestination());
        response.setLocation(hotel.getLocation());
        response.setDescription(hotel.getDescription());
        response.setPriceFrom(hotel.getPriceFrom());
        response.setPriceTo(hotel.getPriceTo());
        response.setImageUrl(hotel.getImageUrl());
        response.setAmenities(amenityList);
        response.setDistrict(hotel.getDistrict());
        response.setApplicationStatus(hotel.getApplicationStatus());
        response.setHotelEmail(hotel.getHotelEmail());
        response.setHotelContactNumber(hotel.getHotelContactNumber());
        return response;
    }
}
