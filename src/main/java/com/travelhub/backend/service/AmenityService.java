package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AmenityRequest;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private HotelRepository hotelRepository;

    // POST /api/amenities — Add a new amenity
    public Amenity addAmenity(AmenityRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        if (!"Approved".equalsIgnoreCase(hotel.getApplicationStatus())) {
            throw new RuntimeException("Action disabled. Hotel status is: " + hotel.getApplicationStatus());
        }

        Amenity amenity = Amenity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .iconName(request.getIconName())
                .hotel(hotel)
                .build();
        return amenityRepository.save(amenity);
    }

    // GET /api/amenities — Fetch all amenities
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    // Fetch amenities for a specific hotel
    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findByHotelId(hotelId);
    }

    // GET /api/amenities/{id} — Fetch single amenity (optional but good practice)
    public Amenity getAmenityById(Long id) {
        return amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "id", id));
    }

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

    public void deleteAmenity(Long id) {
        Amenity amenity = getAmenityById(id);

        if (!"Approved".equalsIgnoreCase(amenity.getHotel().getApplicationStatus())) {
            throw new RuntimeException("Action disabled. Hotel status is: " + amenity.getHotel().getApplicationStatus());
        }

        amenityRepository.delete(amenity);
    }
}