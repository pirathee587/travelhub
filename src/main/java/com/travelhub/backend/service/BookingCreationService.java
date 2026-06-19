package com.travelhub.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(BookingCreationService.class);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;
    private final BookingHotelPreferenceRepository bookingHotelPreferenceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BookingResponse createBooking(BookingRequest request) {
        logger.info("========== BOOKING CREATION START ==========");
        logger.info("User ID: {}", request.getUserId());
        logger.info("Package ID: {}", request.getPackageId());
        logger.info("Hotels: {}", request.getHotelIds() != null ? request.getHotelIds().size() : "None");
        logger.info("Start Date: {}", request.getStartDate());
        logger.info("Guests: {} adults, {} children", request.getAdults(), request.getChildren());

        logger.debug("Step 1: Validating user ID {}", request.getUserId());             {/* User validate */}
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> {
                    logger.error("User not found: {}", request.getUserId());
                    return new RuntimeException("User with ID " + request.getUserId() + " not found. Please ensure you are logged in.");
                });
        logger.info("✓ User validated: {}", user.getEmail());

        logger.debug("Step 2: Validating package ID {}", request.getPackageId());       {/* Package validate */}
        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> {
                    logger.error("Package not found: {}", request.getPackageId());
                    return new RuntimeException("Package with ID " + request.getPackageId() + " not found");
                });
        logger.info("✓ Package validated: {}", pkg.getPackageName());

        // Validate hotel preferences if hotelIds provided
        if (request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            logger.debug("Step 3: Validating {} hotels", request.getHotelIds().size());
            for (Long hotelId : request.getHotelIds()) {
                Hotel h = hotelRepository.findById(hotelId)                                     //Hotel District Validation
                        .orElseThrow(() -> {
                            logger.error("Hotel not found: {}", hotelId);
                            return new RuntimeException("Hotel not found: " + hotelId);
                        });
                
                // District Matching Validation                 
                if (h.getDistrict() != null && pkg.getDistrict() != null                         //package and hotel both have district info, validate they match
                    && !h.getDistrict().equalsIgnoreCase(pkg.getDistrict())) {          
                    logger.error("District mismatch: hotel={}, package={}", h.getDistrict(), pkg.getDistrict());
                    throw new RuntimeException("Selected hotel's district does not match package's district");
                }
                logger.debug("  ✓ Hotel validated: {} ({})", h.getHotelName(), h.getDistrict());
            }
            logger.info("✓ All hotels validated");
        }
        
        // Step 4: Calculate end date from start date + duration
        logger.debug("Step 4: Calculating end date from {} + {}", request.getStartDate(), request.getDuration());
        LocalDate endDate = calculateEndDate(request.getStartDate(), request.getDuration() != null ? request.getDuration() : pkg.getDuration());
        logger.info("✓ End date calculated: {}", endDate);
        
        // Step 5: Convert hotelIds list with preference order to JSON string
        String hotelIdsWithPreference = convertHotelIdsToJson(request.getHotelIds());
        logger.debug("Step 5: Hotel IDs JSON: {}", hotelIdsWithPreference);

        // Step 6: Create Booking                                                                       //Booking Here
        logger.debug("Step 6: Creating booking entity");
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
        logger.info("✓ Booking saved: ID={}", saved.getId());
        
        // Step 7: Save hotel preferences to separate table
        if (request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            logger.debug("Step 7: Saving {} hotel preferences", request.getHotelIds().size());
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
            logger.info("✓ Hotel preferences saved");
        }
        
        // Step 8: Fetch and return response
        logger.debug("Step 8: Fetching booking response");
        BookingResponse response = bookingService.getBookingById(saved.getId());
        logger.info("========== BOOKING CREATION SUCCESS ==========");
        logger.info("Booking ID: {}", response.getId());
        logger.info("Booking Reference: {}", response.getBookingId());
        
        return response;
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
        logger.info("========== BOOKING CANCELLATION START ==========");
        logger.info("Booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> {
                    logger.error("Booking not found: {}", bookingId);
                    return new RuntimeException("Booking not found");
                });

        booking.setStatus("cancelled");
        Booking saved = bookingRepository.save(booking);
        logger.info("✓ Booking cancelled: {}", saved.getId());
        
        return bookingService.getBookingById(saved.getId());
    }
}