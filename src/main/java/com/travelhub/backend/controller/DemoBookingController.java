package com.travelhub.backend.controller;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PackageRepository;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * DemoBookingController provides specialized utility endpoints for simulating travel reservations.
 * It is designed for development and demonstration purposes to quickly populate the system with mock data.
 */
@RestController
@RequestMapping("/api/demo/bookings")
public class DemoBookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;

    /**
     * Constructor injection for direct manipulation of users, packages, and bookings.
     */
    public DemoBookingController(BookingRepository bookingRepository, UserRepository userRepository, PackageRepository packageRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
    }

    /**
     * Endpoint to generate a single mock booking.
     * Logic:
     * 1. Finds or creates a dummy tourist user.
     * 2. Finds or creates a dummy travel package.
     * 3. Persists a new 'Pending' reservation linked to both.
     * Useful for testing dashboard visualizations and booking queues.
     */
    @GetMapping("/create")
    public String createMockBooking() {
        // Resolve or create a demo user
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User u = new User();
            u.setName("Demo User");
            u.setEmail("demo@example.com");
            u.setPassword("password");
            u.setRole(com.travelhub.backend.enums.Role.TOURIST);
            return userRepository.save(u);
        });

        // Resolve or create a demo travel package
        Package pkg = packageRepository.findAll().stream().findFirst().orElseGet(() -> {
            Package p = new Package();
            p.setPackageName("Sri Lanka Paradise");
            p.setPriceFrom(50000.0);
            p.setDestination("Colombo");
            p.setAgent(null); 
            return packageRepository.save(p);
        });

        // Construct and save the mock reservation
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPkg(pkg);
        booking.setTotalPrice(pkg.getPriceFrom());
        booking.setStatus("Pending");
        booking = bookingRepository.save(booking);

        return "Mock Booking Created with ID: " + booking.getId();
    }
}
