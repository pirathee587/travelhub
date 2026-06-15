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

/**
 * OwnerHotelService manages the hotel properties from the owner's perspective.
 * It handles property registration, status tracking, and profile updates with integrated image handling.
 */
@Service
@Transactional(readOnly = true)
public class OwnerHotelService {

    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ImageUploadService imageUploadService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Constructor injection for repositories, multimedia, and event publishing services.
     */
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

    /**
     * Retrieves hotels managed by the owner, filtered by their application status.
     * Maps the internal status strings to consistent values (Pending, Rejected, Approved).
     */
    public List<HotelResponse> getOwnerHotels(String status) {
        String targetStatus = "Approved"; // Default fallback
        
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

    /**
     * Registers a new hotel property.
     * Handles image upload and publishes a system event for administrative notification.
     */
    @Transactional
    public HotelResponse createHotel(OwnerHotelRequest request, MultipartFile hotelImage, String email) {
        // Resolve the persistent User entity for the owner
        User owner = (email != null && !email.isBlank())
                ? userRepository.findByEmail(email).orElse(null)
                : null;

        String imageUrl = request.getImageUrl();
        if (hotelImage != null && !hotelImage.isEmpty()) {
            try {
                imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
            } catch (Exception e) {
                // Log and fallback to a default placeholder if upload fails
                System.err.println("Warning: Hotel image upload failed: " + e.getMessage());
                if (imageUrl == null || imageUrl.isBlank()) {
                    imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";
                }
            }
        }

        // Initialize and populate the persistent Hotel entity
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
        hotel.setApplicationStatus("Pending"); // New hotels start in Pending state
        hotel.setOwner(owner);

        hotel = hotelRepository.save(hotel);
        
        // Notify stakeholders via system events (e.g., for Admin review)
        eventPublisher.publishEvent(new HotelEvent(this, hotel, "CREATED"));
        
        return toHotelResponse(hotel);
    }

    /**
     * Updates an existing hotel's details.
     * Only updates imagery if a new file is explicitly provided.
     */
    @Transactional
    public HotelResponse updateHotel(Long id, OwnerHotelRequest request, MultipartFile hotelImage) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

        // Multimedia update logic
        if (hotelImage != null && !hotelImage.isEmpty()) {
            try {
                String imageUrl = imageUploadService.uploadHotelImage(hotelImage).getImageUrl();
                hotel.setImageUrl(imageUrl);
            } catch (Exception e) {
                System.err.println("Warning: Hotel image update failed: " + e.getMessage());
            }
        }

        // Synchronize entity state with request data
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

    /**
     * Deletes a hotel property from the platform.
     */
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
    }

    /**
     * Maps a Hotel entity to a response DTO.
     * Consolidates complex relationships like amenities into a flat list for the UI.
     */
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
