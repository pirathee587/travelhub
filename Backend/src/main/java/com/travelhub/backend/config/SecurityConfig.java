package com.travelhub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/packages/**").permitAll()
                        .requestMatchers("/api/hotels/**").permitAll()
                        .requestMatchers("/api/tourist/**").permitAll()
                        .requestMatchers("/api/reviews/**").permitAll() // Feature B: Reviews
                        .requestMatchers("/api/upload/**").permitAll()   // Feature A: Image Upload
                        .requestMatchers("/uploads/**").permitAll()       // Feature A: Serve saved images
                        .anyRequest().permitAll()
                );
        return http.build();
    }
}
