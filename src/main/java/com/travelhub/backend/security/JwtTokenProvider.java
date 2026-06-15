package com.travelhub.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import com.travelhub.backend.entity.User;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtTokenProvider is responsible for the creation, parsing, and validation of JSON Web Tokens.
 * It encapsulates the cryptographic logic required to maintain stateless user sessions.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:travelhub_secret_key_minimum_32_chars_long}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    /**
     * Generates a cryptographic signing key from the configured JWT secret.
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generates a new JWT for an authenticated user.
     * Injects custom domain claims (Role, IDs) into the payload to allow the frontend and backend 
     * to perform scoped operations without redundant database lookups.
     */
    public String generateToken(Authentication authentication, User user) {
        Map<String, Object> claims = new HashMap<>();
        // Inject business-critical identity markers into the token payload
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("agentId", user.getAgentProfile() != null ? user.getAgentProfile().getId() : null);
        claims.put("hotelId", (user.getOwnedHotels() != null && !user.getOwnedHotels().isEmpty()) ? user.getOwnedHotels().get(0).getId() : null);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the subject (User Email) from a signed JWT payload.
     */
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Verifies the cryptographic integrity and expiration status of a provided JWT.
     * @return true if the token is valid and signed by this server, false otherwise.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // Catches ExpiredJwtException, SignatureException, MalformedJwtException, etc.
            return false;
        }
    }
}