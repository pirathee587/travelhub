package com.travelhub.backend.unit.auth;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.response.LoginResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.HotelRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.security.JwtTokenProvider;
import com.travelhub.backend.service.AuthService;
import com.travelhub.backend.service.EmailService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * Unit tests for AuthService.
 * Tests register and login logic using Mockito mocks — no real database needed.
 */
@Listeners(MockitoTestNGListener.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private AuthService authService;

    // ─────────────────────────────────────────────────────────────
    // register() tests
    // ─────────────────────────────────────────────────────────────

    @Test(description = "register should throw BadRequestException when email already exists")
    public void register_WhenEmailAlreadyExists_ShouldThrowBadRequestException() {
        RegisterRequest request = buildRegisterRequest("existing@email.com", Role.TOURIST);
        when(userRepository.existsByEmail("existing@email.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test(description = "register should save user and send verification email when email is new")
    public void register_WhenEmailIsNew_ShouldSaveUserAndSendEmail() {
        RegisterRequest request = buildRegisterRequest("new@email.com", Role.TOURIST);
        when(userRepository.existsByEmail("new@email.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");

        User savedUser = User.builder()
                .id(1L)
                .email("new@email.com")
                .name("Test User")
                .role(Role.TOURIST)
                .agentApproved(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

        var response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(userRepository, atLeast(1)).save(any(User.class));
        verify(emailService, times(1)).sendVerificationEmail(anyString(), anyString());
    }

    @Test(description = "register with AGENT role should also create Agent profile")
    public void register_WhenRoleIsAgent_ShouldCreateAgentProfile() {
        RegisterRequest request = buildRegisterRequest("agent@email.com", Role.AGENT);
        request.setAgencyName("Test Agency");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_pass");

        User savedUser = User.builder()
                .id(2L)
                .email("agent@email.com")
                .role(Role.AGENT)
                .agentApproved(false)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

        authService.register(request);

        verify(agentRepository, times(1)).save(any());
    }

    // ─────────────────────────────────────────────────────────────
    // login() tests
    // ─────────────────────────────────────────────────────────────

    @Test(description = "login should return JWT token when credentials are valid")
    public void login_WhenCredentialsValid_ShouldReturnJwtToken() {
        LoginRequest request = LoginRequest.builder()
                .email("user@email.com")
                .password("Password1@")
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(tokenProvider.generateToken(any(Authentication.class), any(User.class))).thenReturn("mock.jwt.token");

        // User must be email-verified and active for login to succeed
        User user = User.builder()
                .id(1L)
                .email("user@email.com")
                .name("Test User")
                .role(Role.TOURIST)
                .isEmailVerified(true)
                .isActive(true)
                .agentApproved(true)
                .build();
        when(userRepository.findByEmail("user@email.com")).thenReturn(Optional.of(user));

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals(response.getToken(), "mock.jwt.token");
    }

    // ─────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────

    private RegisterRequest buildRegisterRequest(String email, Role role) {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail(email);
        request.setPassword("Password1@");
        request.setTelephone("0771234567");
        request.setRole(role);
        request.setPreferredLanguage("English");
        return request;
    }
}
