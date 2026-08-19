package com.travelhub.backend.controller.tourist;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.controller.UserController;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.dto.request.UpdateProfileRequest;
import com.travelhub.backend.dto.response.UserProfileResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.UserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserController userController;

    @org.testng.annotations.BeforeClass
    public void setUpClass() {
        org.springframework.test.util.ReflectionTestUtils.setField(
                com.travelhub.backend.util.SecurityUtils.class,
                "staticJwtSecret",
                "travelhub_secret_key_minimum_32_chars_long_12345"
        );
    }

    @AfterMethod
    public void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test(description = "GET /api/users/me with authenticated user should return 200 with profile")
    public void getCurrentUser_WhenAuthenticated_ShouldReturn200() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("tourist@example.com", "")
        );

        User user = User.builder()
                .id(10L)
                .name("Tourist Name")
                .email("tourist@example.com")
                .role(Role.TOURIST)
                .nationality("Sri Lankan")
                .currencyPreference("USD")
                .build();

        when(userRepository.findByEmail("tourist@example.com")).thenReturn(Optional.of(user));
        when(userService.getProfile(10L)).thenReturn(user);

        ResponseEntity<UserProfileResponse> response = userController.getCurrentUser();

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getEmail(), "tourist@example.com");
        assertEquals(response.getBody().getName(), "Tourist Name");
        verify(userService, times(1)).getProfile(10L);
    }

    @Test(description = "GET /api/users/me without authentication should return 401")
    public void getCurrentUser_WhenUnauthenticated_ShouldReturn401() {
        SecurityContextHolder.clearContext();

        ResponseEntity<UserProfileResponse> response = userController.getCurrentUser();

        assertEquals(response.getStatusCode(), HttpStatus.UNAUTHORIZED);
        verify(userService, never()).getProfile(any());
    }

    @Test(description = "PUT /api/users/profile with valid update should return 200")
    public void updateProfile_WhenAuthenticated_ShouldReturnUpdatedProfile() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("tourist@example.com", "")
        );

        User user = User.builder().id(10L).email("tourist@example.com").build();
        User updated = User.builder().id(10L).name("New Name").email("tourist@example.com").nationality("Canadian").build();

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setName("New Name");
        request.setNationality("Canadian");

        when(userRepository.findByEmail("tourist@example.com")).thenReturn(Optional.of(user));
        when(userService.updateProfile(eq(10L), any(UpdateProfileRequest.class))).thenReturn(updated);

        ResponseEntity<UserProfileResponse> response = userController.updateProfile(request);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        assertEquals(response.getBody().getName(), "New Name");
        verify(userService, times(1)).updateProfile(eq(10L), eq(request));
    }

    @Test(description = "POST /api/users/change-password should return 200 on success")
    public void changePassword_WhenAuthenticated_ShouldReturn200() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("tourist@example.com", "")
        );

        User user = User.builder().id(10L).email("tourist@example.com").build();
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("newPass");

        when(userRepository.findByEmail("tourist@example.com")).thenReturn(Optional.of(user));
        doNothing().when(userService).changePassword(eq(10L), eq(request), any());

        ResponseEntity<?> response = userController.changePassword(request);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertTrue(response.getBody() instanceof ApiResponse);
        ApiResponse body = (ApiResponse) response.getBody();
        assertTrue(body.isSuccess());
        verify(userService, times(1)).changePassword(eq(10L), eq(request), any());
    }
}
