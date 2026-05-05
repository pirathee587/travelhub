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

@Service
@Transactional
public class AmenityService {

    private final AmenityRepository amenityRepository;
    private final HotelRepository hotelRepository;

    public AmenityService(AmenityRepository amenityRepository, HotelRepository hotelRepository) {
        this.amenityRepository = amenityRepository;
        this.hotelRepository = hotelRepository;
    }

    public Amenity addAmenity(AmenityRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", "id", request.getHotelId()));

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

    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    public List<Amenity> getAmenitiesByHotelId(Long hotelId) {
        return amenityRepository.findByHotelId(hotelId);
    }

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