 package com.travelhub.backend.security;

import com.travelhub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * CustomUserDetailsService is responsible for retrieving user authentication and authorization data.
 * It integrates Spring Security with the system's database to verify credentials and permissions during login.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Retrieves a user by their unique email identifier from the database.
     * Transforms the domain entity into a Spring Security UserDetails object.
     * @param email The user's primary credential (login identifier).
     * @throws UsernameNotFoundException if the account does not exist.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Query the repository for the user profile
        com.travelhub.backend.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Construct the Spring Security User object with role-based authorities
        // Note: Internal roles are prefixed with 'ROLE_' to comply with standard security expressions
        return new User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
