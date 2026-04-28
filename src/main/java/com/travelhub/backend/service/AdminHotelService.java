package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminHotelDetailResponse;
import com.travelhub.backend.dto.response.AdminHotelResponse;
import com.travelhub.backend.entity.Amenity;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Room;
import com.travelhub.backend.repository.AmenityRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminHotelService {

    private final HotelRepository   hotelRepository;
    private final RoomRepository    roomRepository;
    private final AmenityRepository amenityRepository;

    // ── Get All Hotels ────────────────────────────────
    public List<AdminHotelResponse> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Hotels By Status ──────────────────────────
    // status = Pending, Approved, Rejected
    public List<AdminHotelResponse> getHotelsByStatus(
            String status) {
        return hotelRepository
                .findByApplicationStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    public AdminHotelDetailResponse getHotelDetail(
            Long id) {

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));


        List<Room> rooms = roomRepository
                .findByHotelId(id);

        // Room types map
        List<AdminHotelDetailResponse.RoomTypeResponse>
                roomTypes = rooms.stream()
                .map(r -> new AdminHotelDetailResponse
                        .RoomTypeResponse(
                        r.getName(),
                        r.getDescription()))
                .toList();


        List<Amenity> amenityEntities =
                amenityRepository.findByHotelId(id);

        List<String> amenities;

        if (!amenityEntities.isEmpty()) {

            amenities = amenityEntities.stream()
                    .map(Amenity::getName)
                    .toList();
        } else if (hotel.getAmenities() != null) {

            amenities = Arrays.asList(
                    hotel.getAmenities().split(","));
        } else {
            amenities = List.of();
        }

        return new AdminHotelDetailResponse(
                hotel.getId(),
                hotel.getHotelName(),
                hotel.getRating(),
                hotel.getImageUrl(),
                hotel.getDistrict(),
                hotel.getLocation(),
                hotel.getNumberOfRooms(),
                roomTypes,
                hotel.getOwnerName(),
                hotel.getOwnerEmail(),
                hotel.getOwnerNic(),
                hotel.getNicImageUrl(),
                hotel.getPhoneNumber(),
                hotel.getHotlineNumber(),
                amenities,
                hotel.getApplicationStatus()
        );
    }

    // ── Approve Hotel ─────────────────────────────────
    public AdminHotelDetailResponse approveHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotel.setApplicationStatus("Approved");
        hotelRepository.save(hotel);
        return getHotelDetail(id);
    }

    // ── Reject Hotel ──────────────────────────────────
    public AdminHotelDetailResponse rejectHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotel.setApplicationStatus("Rejected");
        hotelRepository.save(hotel);
        return getHotelDetail(id);
    }

    // ── Delete Hotel ──────────────────────────────────
    public void deleteHotel(Long id) {
        hotelRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel", "id", id));
        hotelRepository.deleteById(id);
    }

    // ── Map Entity → Response ─────────────────────────
    private AdminHotelResponse mapToResponse(Hotel h) {
        return new AdminHotelResponse(
                h.getId(),
                h.getHotelName(),
                h.getDestination(),
                h.getLocation(),
                h.getDescription(),
                h.getPriceFrom(),
                h.getPriceTo(),
                h.getRating(),
                h.getReviewCount(),
                h.getImageUrl(),
                h.getDistrict(),
                h.getApplicationStatus()
        );
    }
}