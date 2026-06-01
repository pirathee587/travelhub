package com.travelhub.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelhub.backend.dto.request.BookingRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.BookingHotelPreference;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.BookingHotelPreferenceRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingCreationService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;
    private final BookingHotelPreferenceRepository bookingHotelPreferenceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BookingResponse createBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User with ID " + request.getUserId() + " not found. Please ensure you are logged in."));

        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package with ID " + request.getPackageId() + " not found"));

        // Validate hotel preferences if hotelIds provided
        if (request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            for (Long hotelId : request.getHotelIds()) {
                Hotel h = hotelRepository.findById(hotelId)
                        .orElseThrow(() -> new RuntimeException("Hotel not found: " + hotelId));

                // District Matching Validation
                if (h.getDistrict() != null && pkg.getDistrict() != null
                        && !h.getDistrict().equalsIgnoreCase(pkg.getDistrict())) {
                    throw new RuntimeException("Selected hotel's district does not match package's district");
                }
            }
        }

        // Calculate end date from start date + duration
        LocalDate endDate = calculateEndDate(request.getStartDate(), request.getDuration() != null ? request.getDuration() : pkg.getDuration());

        // Convert hotelIds list with preference order to JSON string
        String hotelIdsWithPreference = convertHotelIdsToJson(request.getHotelIds());

        Booking booking = Booking.builder()
                .user(user)
                .pkg(pkg)
                .hotel(null)
                .vehicle(null)
                .status("pending")
                .startDate(request.getStartDate())
                .endDate(endDate)
                .totalPrice(request.getTotalPrice())
                .progress(0)
                .adults(request.getAdults() != null ? request.getAdults() : 0)
                .children(request.getChildren() != null ? request.getChildren() : 0)
                .specialRequests(request.getSpecialRequests())
                .duration(pkg.getDuration())
                .hotelIdsWithPreference(hotelIdsWithPreference)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Save hotel preferences to separate table
        if (request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            List<BookingHotelPreference> preferences = new ArrayList<>();
            for (int i = 0; i < request.getHotelIds().size(); i++) {
                Long hotelId = request.getHotelIds().get(i);
                Hotel hotel = hotelRepository.findById(hotelId).get();

                BookingHotelPreference pref = BookingHotelPreference.builder()
                        .booking(saved)
                        .hotel(hotel)
                        .preferenceNumber(i)
                        .isSelected(true)
                        .build();
                preferences.add(pref);
            }
            bookingHotelPreferenceRepository.saveAll(preferences);
        }

        return bookingService.getBookingById(saved.getId());
    }

    private LocalDate calculateEndDate(LocalDate startDate, String duration) {
        if (duration == null || duration.isEmpty()) {
            return startDate;
        }

        try {
            String[] parts = duration.toLowerCase().trim().split(" ");
            int value = Integer.parseInt(parts[0]);

            if (duration.toLowerCase().contains("week")) {
                return startDate.plusWeeks(value);
            } else if (duration.toLowerCase().contains("day")) {
                return startDate.plusDays(value);
            } else if (duration.toLowerCase().contains("month")) {
                return startDate.plusMonths(value);
            } else {
                return startDate.plusDays(value);
            }
        } catch (Exception e) {
            return startDate;
        }
    }

    private String convertHotelIdsToJson(java.util.List<Long> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return null;
        }

        try {
            Map<String, Object> hotelData = new HashMap<>();
            hotelData.put("hotelIds", hotelIds);
            return objectMapper.writeValueAsString(hotelData);
        } catch (Exception e) {
            return null;
        }
    }

    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("cancelled");
        Booking saved = bookingRepository.save(booking);
        return bookingService.getBookingById(saved.getId());
    }
}