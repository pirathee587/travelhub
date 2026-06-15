package com.travelhub.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;

/**
 * SecurityUtils provides centralized utility methods for interacting with the Spring Security context.
 * It facilitates the extraction of JWT claims and role-specific identifiers from the authenticated session.
 */
@Component
public class SecurityUtils {

    @Value("${jwt.secret:travelhub_secret_key_minimum_32_chars_long}")
    private String jwtSecret;

    // Static bridge for access in static utility methods
    private static String staticJwtSecret;

    /**
     * Initializes the static secret key from the application properties after bean construction.
     */
    @PostConstruct
    public void init() {
        staticJwtSecret = jwtSecret;
    }

    /**
     * Generates a cryptographic signing key from the configured JWT secret.
     */
    private static Key getSigningKey() {
        return Keys.hmacShaKeyFor(staticJwtSecret.getBytes());
    }

    /**
     * Extracts all cryptographic claims from the JWT of the currently authenticated user.
     * Interacts with the SecurityContextHolder to retrieve the token string.
     * @return Claims object if authenticated and token is valid, null otherwise.
     */
    public static Claims getCurrentUserClaims() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getCredentials() == null) {
            return null;
        }

        String token = authentication.getCredentials().toString();
        try {
            return Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            // Log security parsing failures in a real production environment
            return null;
        }
    }

    /**
     * Specialized helper to extract the specific Agent ID of the logged-in agent.
     * Useful for scoping database queries to the authenticated user's business.
     */
    public static Long getCurrentAgentId() {
        Claims claims = getCurrentUserClaims();
        if (claims != null && claims.get("agentId") != null) {
            return Long.valueOf(claims.get("agentId").toString());
        }
        return null;
    }

    /**
     * Specialized helper to extract the specific Hotel ID of the logged-in hotel owner.
     * Useful for managing property-specific resources without passing IDs from the frontend.
     */
    public static Long getCurrentHotelId() {
        Claims claims = getCurrentUserClaims();
        if (claims != null && claims.get("hotelId") != null) {
            return Long.valueOf(claims.get("hotelId").toString());
        }
        return null;
    }

    public static Long getCurrentUserId() {
        Claims claims = getCurrentUserClaims();
        if (claims != null && claims.get("userId") != null) {
            return Long.valueOf(claims.get("userId").toString());
        }
        return null;
    }
}
