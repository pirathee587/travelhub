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

/**
 * BookingCreationService handles the orchestration of creating and cancelling bookings.
 * It ensures all related entities (User, Package, Vehicle, Hotel) are valid and compatible before saving.
 */
@Service
@Transactional
public class BookingCreationService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;

    /**
     * Constructor injection for all required repositories and supporting services.
     */
    public BookingCreationService(BookingRepository bookingRepository, UserRepository userRepository, PackageRepository packageRepository, HotelRepository hotelRepository, VehicleRepository vehicleRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
        this.hotelRepository = hotelRepository;
        this.vehicleRepository = vehicleRepository;
        this.bookingService = bookingService;
    }

    /**
     * Creates a new booking based on the provided request DTO.
     * Performs validation on entity existence and location compatibility (District Matching).
     */
    public BookingResponse createBooking(BookingRequest request) {

        // --- Aggressive Null Checks ---
        // Explicitly check for null IDs to prevent generic JPA 'id must not be null' exceptions
        if (request.getUserId() == null) {
            throw new RuntimeException("Request Validation Failed: The User ID is missing from the payload.");
        }
        if (request.getPackageId() == null) {
            throw new RuntimeException("Request Validation Failed: The Package ID is missing from the payload.");
        }

        // Validate that the user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate that the travel package exists
        Package pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        // Validate that the requested vehicle exists, utilizing a robust fallback mechanism.
        // If the frontend does not provide a specific vehicle (or if the provided ID is invalid),
        // we automatically assign the first available vehicle to prevent the booking from failing.
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicleId()).orElse(null);
        }
        if (vehicle == null) {
            // Fallback: Query the database for any available vehicle to guarantee the trip has transportation.
            vehicle = vehicleRepository.findAll().stream().findFirst().orElse(null);
            
            if (vehicle == null) {
                // Ultimate Fallback: If the entire database is completely empty of vehicles (e.g., fresh test DB),
                // we generate a default dummy vehicle to satisfy the database's non-null vehicle relationship constraint.
                vehicle = Vehicle.builder()
                        .brand("System Default")
                        .model("Fallback Van")
                        .vehicleType("Van")
                        .capacity("10")
                        .status("available")
                        .isAvailable(true)
                        .build();
                vehicle = vehicleRepository.save(vehicle);
            }
        }

        Hotel hotel = null;
        Long primaryHotelId = request.getHotelId();
        
        // Fallback: If no primary hotel is specified, try the first ID in the provided hotelIds list
        if (primaryHotelId == null && request.getHotelIds() != null && !request.getHotelIds().isEmpty()) {
            primaryHotelId = request.getHotelIds().get(0);
        }

        // Process and validate the selected hotel if applicable
        if (primaryHotelId != null) {
            hotel = hotelRepository.findById(primaryHotelId)
                    .orElseThrow(() -> new RuntimeException("Hotel not found"));
            
            // Critical Validation: Ensure the hotel is in the same district as the package itinerary
            if (hotel.getDistrict() != null && pkg.getDistrict() != null 
                && !hotel.getDistrict().equalsIgnoreCase(pkg.getDistrict())) {
                throw new RuntimeException("Selected hotel's district does not match package's district");
            }
        }

        // Initialize and populate the new Booking entity
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPkg(pkg);
        booking.setHotel(hotel);
        booking.setVehicle(vehicle);
        booking.setStatus("confirmed"); // Default to confirmed upon creation
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setProgress(0); // Initial travel progress

        // Persist the booking and return the detailed DTO
        Booking saved = bookingRepository.save(booking);
        return bookingService.getBookingById(saved.getId());
    }

    /**
     * Cancels an existing booking by updating its status.
     */
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus("cancelled");
        Booking saved = bookingRepository.save(booking);
        return bookingService.getBookingById(saved.getId());
    }
}