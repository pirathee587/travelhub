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
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service

@Transactional
public class BookingCreationService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;

    public BookingCreationService(BookingRepository bookingRepository, UserRepository userRepository, PackageRepository packageRepository, HotelRepository hotelRepository, VehicleRepository vehicleRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
        this.hotelRepository = hotelRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingService = bookingService;
    }

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

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPkg(pkg);
        booking.setHotel(hotel);
        booking.setVehicle(vehicle);
        booking.setStatus("confirmed");
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setProgress(0);

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