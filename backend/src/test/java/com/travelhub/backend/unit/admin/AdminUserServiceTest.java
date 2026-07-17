package com.travelhub.backend.unit.admin;

import com.travelhub.backend.dto.response.AdminUserResponse;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.AdminUserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.context.ApplicationEventPublisher;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AdminUserService adminUserService;

    @Test(description = "getAllUsers should return list of all users as AdminUserResponse")
    public void getAllUsers_ShouldReturnAllUsers() {
        User u1 = User.builder().id(1L).name("Alice").email("alice@test.com").role(Role.TOURIST).isActive(true).agentApproved(false).build();
        User u2 = User.builder().id(2L).name("Bob").email("bob@test.com").role(Role.AGENT).isActive(true).agentApproved(true).build();
        when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        List<AdminUserResponse> result = adminUserService.getAllUsers();

        assertNotNull(result);
        assertEquals(result.size(), 2);
        verify(userRepository, times(1)).findAll();
    }

    @Test(description = "getUserById should return AdminUserResponse when user exists")
    public void getUserById_WhenExists_ShouldReturnUser() {
        User user = User.builder().id(1L).name("Alice").email("alice@test.com").role(Role.TOURIST).isActive(true).agentApproved(false).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        AdminUserResponse result = adminUserService.getUserById(1L);

        assertNotNull(result);
        // AdminUserResponse is a Java record — use record accessor method
        assertEquals(result.name(), "Alice");
    }

    @Test(description = "getUserById should throw exception when user not found")
    public void getUserById_WhenNotExists_ShouldThrowException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> adminUserService.getUserById(99L));
    }

    @Test(description = "toggleUserActive should flip isActive on user")
    public void toggleUserActive_ShouldFlipIsActive() {
        User user = User.builder().id(1L).name("Alice").email("alice@test.com").role(Role.TOURIST).isActive(true).agentApproved(false).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        adminUserService.toggleUserActive(1L);

        // isActive should now be false
        assertFalse(user.getIsActive());
        verify(userRepository, times(1)).save(user);
    }
}
