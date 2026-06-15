package com.travelhub.backend.controller;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * DemoAdminController provides administrative utility endpoints for development and testing environments.
 * It allows for rapid state manipulation of user accounts, such as role promotion and verification bypass, without going through standard workflows.
 * WARNING: These endpoints should be disabled or secured in production.
 */
@RestController
@RequestMapping("/api/demo/admin")
public class DemoAdminController {

    private final UserRepository userRepository;

    /**
     * Constructor injection for direct user account manipulation.
     */
    public DemoAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Rapidly promotes an existing user to the 'ADMIN' role.
     * Also marks the account as verified to ensure immediate access to administrative areas.
     */
    @GetMapping("/make-admin")
    public String makeAdmin(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setRole(Role.ADMIN);
            user.setEmailVerified(true);
            userRepository.save(user);
            return "User " + email + " is now an ADMIN and VERIFIED";
        }).orElse("User not found");
    }

    /**
     * Bypasses the email verification process for a specific user.
     * Useful for testing login workflows without accessing a real mailbox.
     */
    @GetMapping("/verify-user")
    public String verifyUser(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
            return "User " + email + " is now VERIFIED";
        }).orElse("User not found");
    }
}
