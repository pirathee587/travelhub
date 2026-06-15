package com.travelhub.backend.config;

import com.travelhub.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * SecurityConfig is the central security policy engine for the TravelHub backend.
 * It configures authentication, authorization, CORS, and password encryption strategies.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize for fine-grained method-level security
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Constructor injection for the JWT filter.
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Exposes the AuthenticationManager bean for use in the AuthService.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Configures the main HTTP security filter chain.
     * Defines URL permit/deny rules, session management, and filter ordering.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF as we use stateless JWT authentication
                .csrf(csrf -> csrf.disable()) 
                // Ensure no JSESSIONID is created on the server
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
                .authorizeHttpRequests(auth -> auth

                        // ── Public Access (No Authentication Required) ──
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/payments/notify", "/api/payments/return").permitAll()
                        .requestMatchers("/api/demo/notifications/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/packages/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hotels/**").permitAll()
                        .requestMatchers("/api/v1/owner/hotels/**").permitAll()
                        .requestMatchers("/api/v1/rooms/**").permitAll()
                        .requestMatchers("/api/v1/amenities/**").permitAll()
                        .requestMatchers("/api/reviews/**").permitAll()
                        .requestMatchers("/api/upload/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll() // Serve static uploaded files
                        .requestMatchers("/api/tourist/**").permitAll()

                        // ── Administrative Lockdown ──
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ── Secured Application Logic ──
                        .requestMatchers("/api/v1/**").authenticated()
                        
                        // Default fallback
                        .anyRequest().permitAll()
                )
                // Register JWT filter before standard authentication filter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) policies.
     * Allows specific frontend origins and methods to communicate with the API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Authorized frontend origins
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:8082", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Defines the BCrypt-based password encoder for secure credential storage.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}