package com.travelhub.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthenticationFilter is a security interceptor that runs for every incoming HTTP request.
 * It extracts the JWT from the request header, validates it, and establishes the user's security context 
 * if a valid token is present.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    /**
     * The core filtering logic that executes once per request.
     * 1. Extracts the token from the 'Authorization' header.
     * 2. Validates the token's cryptographic integrity.
     * 3. Loads user details and populates the SecurityContext.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Retrieve the raw JWT string from the request
            String jwt = getJwtFromRequest(request);

            // If token exists and is cryptographically valid
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // Extract identity from token subject
                String email = tokenProvider.getEmailFromToken(jwt);

                // Load user authoritative data (roles, status) from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                
                // Construct the authentication object for Spring Security
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, jwt, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Finalize the security context for this specific request thread
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                // Useful for debugging unauthenticated access to protected resources
                System.out.println("[JWT] No valid token found for: " + request.getRequestURI());
            }
        } catch (Exception ex) {
            // Log security failures without leaking details to the client
            System.out.println("[JWT] Authentication error: " + ex.getMessage());
        }

        // Continue the filter chain processing
        filterChain.doFilter(request, response);
    }

    /**
     * Helper method to parse the 'Authorization' header.
     * Expects the standard 'Bearer <token>' format.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
