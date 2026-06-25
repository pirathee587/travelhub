package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    public void setUp() {
        user = new User();
        user.setId(1L);
        user.setPassword("hashed_old_password");
    }

    @Test
    public void testChangePassword_Success() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("old_password");
        request.setNewPassword("new_password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old_password", "hashed_old_password")).thenReturn(true);
        when(passwordEncoder.matches("new_password", "hashed_old_password")).thenReturn(false);
        when(passwordEncoder.encode("new_password")).thenReturn("hashed_new_password");

        userService.changePassword(1L, request);

        assertEquals("hashed_new_password", user.getPassword());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    public void testChangePassword_IncorrectOldPassword() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrong_old_password");
        request.setNewPassword("new_password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong_old_password", "hashed_old_password")).thenReturn(false);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.changePassword(1L, request);
        });

        assertEquals("Current password is incorrect", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testChangePassword_NewPasswordSameAsOld() {
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("old_password");
        request.setNewPassword("old_password");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old_password", "hashed_old_password")).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.changePassword(1L, request);
        });

        assertEquals("New password cannot be the same as the current password", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
