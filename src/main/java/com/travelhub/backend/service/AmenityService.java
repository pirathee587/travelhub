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

    private String normalizeIconName(String iconName) {
        if (iconName == null || iconName.trim().isEmpty()) {
            return "HelpCircle"; // default fallback
        }
        
        String[] words = iconName.trim().split("(\\s+|-|_)");
        StringBuilder pascalCase = new StringBuilder();
        for (String word : words) {
            if (word.length() > 0) {
                pascalCase.append(Character.toUpperCase(word.charAt(0)))
                          .append(word.substring(1).toLowerCase());
            }
        }
        return pascalCase.toString();
    }

    // POST /api/amenities — Add a new amenity
    public Amenity addAmenity(AmenityRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

        String normalizedIcon = normalizeIconName(request.getIconName());

        Amenity amenity = Amenity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .iconName(normalizedIcon)
                .hotel(hotel)
                .build();
        return amenityRepository.save(amenity);
    }

    // GET /api/amenities — Fetch all amenities
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    // New: Fetch amenities for a specific hotel
    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findByHotelId(hotelId);
    }

    // GET /api/amenities/{id} — Fetch single amenity (optional but good practice)
    public Amenity getAmenityById(Long id) {
        return amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity", "id", id));
    }
}