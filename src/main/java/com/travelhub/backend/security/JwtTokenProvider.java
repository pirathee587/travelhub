package com.travelhub.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret:travelhub_secret_key_minimum_32_chars_long}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;

    // Get signing key — version 0.12.6 uses SecretKey not Key
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Generate Token
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)                          // 0.12.x: .subject() not .setSubject()
                .issuedAt(new Date())                    // 0.12.x: .issuedAt() not .setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    // Get Email from Token
    public String getEmailFromToken(String token) {
        return Jwts.parser()                             // 0.12.x: .parser() not .parserBuilder()
                .verifyWith(getSigningKey())             // 0.12.x: .verifyWith() not .setSigningKey()
                .build()
                .parseSignedClaims(token)                // 0.12.x: .parseSignedClaims() not .parseClaimsJws()
                .getPayload()                            // 0.12.x: .getPayload() not .getBody()
                .getSubject();
    }

    // Validate Token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
