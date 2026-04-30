package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.AmenityRequest;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private HotelRepository hotelRepository;

    // POST /api/amenities — Add a new amenity
    public Amenity addAmenity(AmenityRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

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

    // GET /api/amenities/{id} — Fetch single amenity (optional but good practice)
    public Amenity getAmenityById(Long id) {
        return amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "id", id));
    }
}