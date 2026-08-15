package com.travelhub.backend.unit.user;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.UpdatePasswordRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.UserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test(description = "changePassword with valid current password updates password successfully")
    public void testChangePassword_ValidCurrentPassword_ShouldSucceed() {
        User user = User.builder().id(73L).email("tourist@example.com").password("encoded_old_pass").build();
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("tourist123");
        request.setNewPassword("newpassword123");

        when(userRepository.findById(73L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("tourist123", "encoded_old_pass")).thenReturn(true);
        when(passwordEncoder.encode("newpassword123")).thenReturn("encoded_new_pass");
        when(userRepository.save(any(User.class))).thenReturn(user);

        userService.changePassword(73L, request, passwordEncoder);

        verify(userRepository, times(1)).save(user);
        assertEquals(user.getPassword(), "encoded_new_pass");
    }

    @Test(description = "changePassword with incorrect current password throws BadRequestException")
    public void testChangePassword_IncorrectCurrentPassword_ShouldThrowBadRequestException() {
        User user = User.builder().id(73L).email("tourist@example.com").password("encoded_old_pass").build();
        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrongpass");
        request.setNewPassword("newpassword123");

        when(userRepository.findById(73L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encoded_old_pass")).thenReturn(false);

        BadRequestException ex = expectThrows(BadRequestException.class, () -> userService.changePassword(73L, request, passwordEncoder));
        assertTrue(ex.getMessage().contains("Current password is incorrect"));
        verify(userRepository, never()).save(any());
    }
}
