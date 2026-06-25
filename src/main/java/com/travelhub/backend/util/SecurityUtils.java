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

@Component
public class SecurityUtils {

    @Value("${jwt.secret:travelhub_secret_key_minimum_32_chars_long}")
    private String jwtSecret;

    private static String staticJwtSecret;

    @PostConstruct
    public void init() {
        staticJwtSecret = jwtSecret;
    }

    private static Key getSigningKey() {
        return Keys.hmacShaKeyFor(staticJwtSecret.getBytes());
    }

    /**
     * Extracts all claims from the JWT of the currently authenticated user.
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
            return null;
        }
    }

    /**
     * Helper to get the Agent ID of the logged-in user.
     */
    public static Long getCurrentAgentId() {
        Claims claims = getCurrentUserClaims();
        if (claims != null && claims.get("agentId") != null) {
            return Long.valueOf(claims.get("agentId").toString());
        }
        return null;
    }

    /**
     * Helper to get the Hotel ID of the logged-in user.
     */
    public static Long getCurrentHotelId() {
        Claims claims = getCurrentUserClaims();
        if (claims != null && claims.get("hotelId") != null) {
            return Long.valueOf(claims.get("hotelId").toString());
        }
        return null;
    }
}
