package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AmenityRequest;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * AmenityService manages the features and services provided by hotels (e.g., WiFi, Pool).
 * It handles the categorization of amenities and their visual representations (icons) for property listings.
 */
@Service
@Transactional
public class AmenityService {

    private final AmenityRepository amenityRepository;
    private final HotelRepository hotelRepository;

    /**
     * Constructor injection for amenity and hotel repositories.
     */
    public AmenityService(AmenityRepository amenityRepository, HotelRepository hotelRepository) {
        this.amenityRepository = amenityRepository;
        this.hotelRepository = hotelRepository;
    }

    /**
     * Registers a new amenity for a specific hotel.
     * Includes a critical validation check: only hotels with 'Approved' status can manage amenities.
     */
    public Amenity addAmenity(AmenityRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        // Business Rule: Hotels must be approved before features can be modified
        if (!"Approved".equalsIgnoreCase(hotel.getApplicationStatus())) {
            throw new RuntimeException("Action disabled. Hotel status is: " + hotel.getApplicationStatus());
        }

        Amenity amenity = new Amenity();
        amenity.setName(request.getName());
        amenity.setDescription(request.getDescription());
        amenity.setIconName(request.getIconName());
        amenity.setHotel(hotel);
        
        return amenityRepository.save(amenity);
    }

    /**
     * Retrieves all amenities registered across the platform.
     */
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    /**
     * Retrieves all amenities associated with a specific hotel.
     */
    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findByHotelId(hotelId);
    }

    /**
     * Retrieves metadata for a single specific amenity by its unique ID.
     */
    public Amenity getAmenityById(Long id) {
        return amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "id", id));
    }

    /**
     * Updates an existing amenity's details.
     * Continues to enforce the 'Approved' hotel status requirement.
     */
    public Amenity updateAmenity(Long id, AmenityRequest request) {
        Amenity amenity = getAmenityById(id);

        if (!"Approved".equalsIgnoreCase(amenity.getHotel().getApplicationStatus())) {
            throw new RuntimeException("Action disabled. Hotel status is: " + amenity.getHotel().getApplicationStatus());
        }

        amenity.setName(request.getName());
        amenity.setDescription(request.getDescription());
        amenity.setIconName(request.getIconName());
        return amenityRepository.save(amenity);
    }

    /**
     * Permanently removes an amenity from a hotel's feature list.
     */
    public void deleteAmenity(Long id) {
        Amenity amenity = getAmenityById(id);

        if (!"Approved".equalsIgnoreCase(amenity.getHotel().getApplicationStatus())) {
            throw new RuntimeException("Action disabled. Hotel status is: " + amenity.getHotel().getApplicationStatus());
        }

        amenityRepository.delete(amenity);
    }
}