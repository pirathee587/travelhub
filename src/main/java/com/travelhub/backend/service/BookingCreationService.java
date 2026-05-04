package com.travelhub.backend.service;

import com.travelhub.backend.dto.request.BookingRequest;
import com.travelhub.backend.dto.response.BookingResponse;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Hotel;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.Vehicle;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

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

    public BookingResponse createBooking(BookingRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Hotel hotel = null;
        Long primaryHotelId = request.getHotelId();
        
        // Fallback to first hotel in hotelIds list if hotelId is null
        if (primaryHotelId == null && request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            primaryHotelId = request.getHotelIds().get(0);
        }

        if (primaryHotelId != null) {
            hotel = hotelRepository.findById(primaryHotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            
            // District Matching Validation
            if (hotel.getDistrict() != null && pkg.getDistrict() != null 
                && !hotel.getDistrict().equalsIgnoreCase(pkg.getDistrict())) {
                throw new RuntimeException("Selected hotel's district does not match package's district");
            }
        }

        Booking booking = Booking.builder()
                .user(user)
                .pkg(pkg)
                .hotel(hotel)
                .vehicle(vehicle)
                .status("confirmed")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(request.getTotalPrice())
                .progress(0)
                .build();

        Booking saved = bookingRepository.save(booking);
        return bookingService.getBookingById(saved.getId());
    }

    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("cancelled");
        Booking saved = bookingRepository.save(booking);
        return bookingService.getBookingById(saved.getId());
    }
}