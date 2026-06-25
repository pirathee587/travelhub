package com.travelhub.backend.config;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Seeds the default System Admin account (admin@travelhub.com / admin)
 * on every startup if it doesn't already exist.
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDefaultAdmin() {
        return args -> {
            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount == 0) {
                User admin = User.builder()
                        .name("System Admin")
                        .email("admin@travelhub.com")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ADMIN)
                        .isEmailVerified(true)
                        .status("ACTIVE")
                        .isActive(true)
                        .agentApproved(true)
                        .build();

                userRepository.save(admin);
                System.out.println("==================================================");
                System.out.println("[DataInitializer] ✅ Default admin created!");
                System.out.println("  Email   : admin@travelhub.com");
                System.out.println("  Password: admin");
                System.out.println("  Role    : ADMIN");
                System.out.println("==================================================");
            } else {
                // Set password of all existing admin accounts to 'admin' for easy access
                java.util.List<User> existingAdmins = userRepository.findByRole(Role.ADMIN);
                System.out.println("==================================================");
                System.out.println("[DataInitializer] Resetting passwords for all admins to 'admin':");
                for (User admin : existingAdmins) {
                    admin.setPassword(passwordEncoder.encode("admin"));
                    admin.setIsActive(true);
                    admin.setEmailVerified(true);
                    userRepository.save(admin);
                    System.out.println("  - Email: " + admin.getEmail() + " | Password: admin");
                }
                System.out.println("==================================================");
            }
        };
    }
}
