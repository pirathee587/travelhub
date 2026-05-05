package com.travelhub.backend.controller;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo/admin")
public class DemoAdminController {

    private final UserRepository userRepository;

    public DemoAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/make-admin")
    public String makeAdmin(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setRole(Role.ADMIN);
            user.setEmailVerified(true);
            userRepository.save(user);
            return "User " + email + " is now an ADMIN and VERIFIED";
        }).orElse("User not found");
    }

    @GetMapping("/verify-user")
    public String verifyUser(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
            return "User " + email + " is now VERIFIED";
        }).orElse("User not found");
    }
}
