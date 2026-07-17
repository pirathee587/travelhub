package com.travelhub.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import static org.mockito.Mockito.*;

@Listeners(MockitoTestNGListener.class)
public class JwtAuthFilterTest {

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthFilter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Test(description = "Filter should skip authentication when Authorization header is missing")
    public void doFilter_WhenNoAuthHeader_ShouldContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(tokenProvider, never()).validateToken(anyString());
    }

    @Test(description = "Filter should skip when Authorization header does not start with Bearer")
    public void doFilter_WhenInvalidAuthHeaderFormat_ShouldContinueChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic invalidtoken");

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(tokenProvider, never()).validateToken(anyString());
    }

    @Test(description = "Filter should reject request when JWT token is invalid")
    public void doFilter_WhenInvalidToken_ShouldContinueChainWithoutAuth() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid.token.here");
        when(tokenProvider.validateToken("invalid.token.here")).thenReturn(false);

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }
}
