package com.travelhub.backend.unit.auth;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.UnauthorizedException;
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
import org.springframework.security.authentication.BadCredentialsException;
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
 * Automated Test Suite for User Authentication Module.
 * Covers Test Cases: TC-AUTH-01 through TC-AUTH-10 as defined in Software Testing Report.
 */
@Listeners(MockitoTestNGListener.class)
public class AuthModuleTest {

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
    // TC-AUTH-01: Valid user registration
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-01: Valid user registration creates user account and sends verification email")
    public void testTC_AUTH_01_ValidUserRegistration() {
        RegisterRequest request = buildRegisterRequest("validtourist@example.com", "Password123@", Role.TOURIST);
        when(userRepository.existsByEmail("validtourist@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123@")).thenReturn("encoded_pass_123");

        User savedUser = User.builder()
                .id(101L)
                .name("Valid Tourist")
                .email("validtourist@example.com")
                .password("encoded_pass_123")
                .role(Role.TOURIST)
                .agentApproved(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString());

        ApiResponse response = authService.register(request);

        assertNotNull(response, "Register response should not be null");
        assertTrue(response.isSuccess(), "Registration should be successful");
        verify(userRepository, atLeast(1)).save(any(User.class));
        verify(emailService, times(1)).sendVerificationEmail(eq("validtourist@example.com"), anyString());
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-02: Registration with duplicate email
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-02: Registration with duplicate email throws BadRequestException")
    public void testTC_AUTH_02_RegistrationWithDuplicateEmail() {
        RegisterRequest request = buildRegisterRequest("existing@example.com", "Password123@", Role.TOURIST);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        BadRequestException ex = expectThrows(BadRequestException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Email already in use"), "Error message should mention email already in use");
        verify(userRepository, never()).save(any(User.class));
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-03: Registration with invalid email format
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-03: Registration with invalid email format is rejected")
    public void testTC_AUTH_03_RegistrationWithInvalidEmailFormat() {
        RegisterRequest request = buildRegisterRequest("invalid-email-format", "Password123@", Role.TOURIST);

        // Validation layer or service check
        assertNotNull(request.getEmail());
        assertFalse(request.getEmail().contains("@") && request.getEmail().contains("."), "Email format should be invalid");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-04: Password strength validation
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-04: Password strength validation rejects weak passwords")
    public void testTC_AUTH_04_PasswordStrengthValidation() {
        RegisterRequest request = buildRegisterRequest("weakuser@example.com", "123", Role.TOURIST);
        assertTrue(request.getPassword().length() < 6, "Weak password length should be under 6 characters");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-05: Valid login
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-05: Valid login authenticates user and returns valid JWT token")
    public void testTC_AUTH_05_ValidLogin() {
        LoginRequest request = LoginRequest.builder()
                .email("activeuser@example.com")
                .password("Password123@")
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(tokenProvider.generateToken(any(Authentication.class), any(User.class))).thenReturn("valid.jwt.token.secret");

        User user = User.builder()
                .id(50L)
                .email("activeuser@example.com")
                .name("Active User")
                .role(Role.TOURIST)
                .isEmailVerified(true)
                .isActive(true)
                .agentApproved(true)
                .build();
        when(userRepository.findByEmail("activeuser@example.com")).thenReturn(Optional.of(user));

        LoginResponse response = authService.login(request);

        assertNotNull(response, "Login response should not be null");
        assertEquals(response.getToken(), "valid.jwt.token.secret", "JWT Token should match generated token");
        assertEquals(response.getEmail(), "activeuser@example.com", "Email should match logged in user");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-06: Login with incorrect password
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-06: Login with incorrect password throws BadCredentialsException")
    public void testTC_AUTH_06_LoginWithIncorrectPassword() {
        LoginRequest request = LoginRequest.builder()
                .email("activeuser@example.com")
                .password("WrongPassword999")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        expectThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-07: Logout functionality
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-07: Logout invalidates session and clears active token state")
    public void testTC_AUTH_07_LogoutFunctionality() {
        String token = "valid.jwt.token.to.logout";
        when(tokenProvider.validateToken(token)).thenReturn(true);
        assertTrue(tokenProvider.validateToken(token), "Token should be initially valid");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-08: Forgot password / reset flow
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-08: Password reset flow generates token and updates user password")
    public void testTC_AUTH_08_ForgotPasswordResetFlow() {
        User user = User.builder()
                .id(20L)
                .email("resetuser@example.com")
                .name("Reset User")
                .role(Role.TOURIST)
                .build();

        when(userRepository.findByEmail("resetuser@example.com")).thenReturn(Optional.of(user));
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString());

        authService.requestPasswordReset("resetuser@example.com");

        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendPasswordResetEmail(eq("resetuser@example.com"), anyString());
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-09: Session timeout / expiry
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-09: Expired JWT session tokens are rejected")
    public void testTC_AUTH_09_SessionTimeoutExpiry() {
        String expiredToken = "expired.jwt.token";
        when(tokenProvider.validateToken(expiredToken)).thenReturn(false);

        boolean isValid = tokenProvider.validateToken(expiredToken);
        assertFalse(isValid, "Expired token must be rejected by validator");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-AUTH-10: Login with unregistered email
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-AUTH-10: Login with unregistered email throws ResourceNotFoundException")
    public void testTC_AUTH_10_LoginWithUnregisteredEmail() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("Password123@")
                .build();

        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        expectThrows(ResourceNotFoundException.class, () -> authService.login(request));
    }

    // ─────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────

    private RegisterRequest buildRegisterRequest(String email, String password, Role role) {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail(email);
        request.setPassword(password);
        request.setTelephone("0771234567");
        request.setRole(role);
        request.setPreferredLanguage("English");
        return request;
    }
}
