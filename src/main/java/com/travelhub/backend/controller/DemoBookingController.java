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

@RestController
@RequestMapping("/api/demo/bookings")
public class DemoBookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PackageRepository packageRepository;

    public DemoBookingController(BookingRepository bookingRepository, UserRepository userRepository, PackageRepository packageRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
    }

    @GetMapping("/create")
    public String createMockBooking() {
        User user = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User u = new User();
            u.setName("Demo User");
            u.setEmail("demo@example.com");
            u.setPassword("password");
            u.setRole(com.travelhub.backend.enums.Role.TOURIST);
            return userRepository.save(u);
        });

        Package pkg = packageRepository.findAll().stream().findFirst().orElseGet(() -> {
            Package p = new Package();
            p.setPackageName("Sri Lanka Paradise");
            p.setPriceFrom(50000.0);
            p.setDestination("Colombo");
            p.setAgent(null); // Just null for now to avoid complexity, or find an agent
            return packageRepository.save(p);
        });

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setPkg(pkg);
        booking.setTotalPrice(pkg.getPriceFrom());
        booking.setStatus("Pending");
        booking = bookingRepository.save(booking);

        return "Mock Booking Created with ID: " + booking.getId();
    }
}
