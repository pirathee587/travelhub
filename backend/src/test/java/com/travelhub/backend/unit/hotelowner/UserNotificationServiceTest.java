package com.travelhub.backend.unit.hotelowner;

import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.UserNotification;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserNotificationRepository;
import com.travelhub.backend.service.UserNotificationService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class UserNotificationServiceTest {

    @Mock
    private UserNotificationRepository userNotificationRepository;

    @InjectMocks
    private UserNotificationService userNotificationService;

    // ─────────────────────────────────────────────────────────────
    // Test 1: Reviews & Notifications — Notification Bell Dropdown
    // ─────────────────────────────────────────────────────────────
    @Test(description = "getUserNotifications should return recent owner notifications for the bell dropdown")
    public void getUserNotifications_ShouldReturnRecentNotifications() {
        // ARRANGE
        User owner = new User();
        owner.setId(1L);
        
        UserNotification n1 = new UserNotification();
        n1.setId(10L);
        n1.setUser(owner);
        n1.setTitle("New Booking");
        n1.setRead(false);
        
        UserNotification n2 = new UserNotification();
        n2.setId(11L);
        n2.setUser(owner);
        n2.setTitle("New Review");
        n2.setRead(false);
        
        when(userNotificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(n1, n2));

        // ACT
        List<UserNotificationResponse> result = userNotificationService.getUserNotifications(1L);

        // ASSERT
        assertNotNull(result);
        assertEquals(result.size(), 2);
        assertEquals(result.get(0).getTitle(), "New Booking");
        assertFalse(result.get(0).getRead());
        verify(userNotificationRepository, times(1)).findByUserIdOrderByCreatedAtDesc(1L);
    }
}
