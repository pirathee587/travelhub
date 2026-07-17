package com.travelhub.backend.controller.auth;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.LoginRequest;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.dto.response.LoginResponse;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.service.AuthService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private com.travelhub.backend.controller.AuthController authController;

    @Test(description = "POST /register should return 200 with success message")
    public void register_ShouldReturn200_WithSuccessResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@email.com");
        request.setPassword("password");
        request.setRole(Role.TOURIST);

        ApiResponse mockResponse = new ApiResponse(true, "Registration successful");
        when(authService.register(request)).thenReturn(mockResponse);

        var response = authController.registerUser(request);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertTrue(response.getBody().isSuccess());
        verify(authService, times(1)).register(request);
    }

    @Test(description = "POST /login should return 200 with JWT token")
    public void login_ShouldReturn200_WithJwtToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@email.com");
        request.setPassword("password");

        LoginResponse mockResponse = LoginResponse.builder()
                .token("mock.jwt.token")
                .build();
        when(authService.login(request)).thenReturn(mockResponse);

        var response = authController.authenticateUser(request);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody().getToken());
        verify(authService, times(1)).login(request);
    }

    @Test(description = "GET /verify should return 200 when token is valid")
    public void verifyEmail_ShouldReturn200_WhenTokenValid() {
        ApiResponse mockResponse = new ApiResponse(true, "Email verified");
        when(authService.verifyEmail("valid-token")).thenReturn(mockResponse);

        var response = authController.verifyEmail("valid-token");

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertTrue(response.getBody().isSuccess());
    }

    @Test(description = "POST /forgot-password should return 200")
    public void forgotPassword_ShouldReturn200() {
        com.travelhub.backend.dto.request.ForgotPasswordRequest request =
                new com.travelhub.backend.dto.request.ForgotPasswordRequest();
        request.setEmail("user@email.com");

        ApiResponse mockResponse = new ApiResponse(true, "Reset email sent");
        when(authService.requestPasswordReset("user@email.com")).thenReturn(mockResponse);

        var response = authController.forgotPassword(request);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
    }
}
