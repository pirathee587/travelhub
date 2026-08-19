package com.travelhub.backend.unit.tourist;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.UserNotificationResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.UserNotification;
import com.travelhub.backend.repository.NotificationRepository;
import com.travelhub.backend.repository.UserNotificationRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.UserNotificationService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class UserNotificationServiceTest {

    @Mock
    private UserNotificationRepository userNotificationRepository;

    @Mock
    private NotificationRepository agentNotificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserNotificationService userNotificationService;

    @Test(description = "notifyUser should create and save unread user notification")
    public void notifyUser_ValidUser_ShouldCreateNotification() {
        User user = User.builder().id(10L).name("Tourist One").build();
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        userNotificationService.notifyUser(10L, "BOOKING_CONFIRMED", "Booking Confirmed",
                "Your booking for Ella Tour has been confirmed.", "/trips/10");

        verify(userNotificationRepository, times(1)).save(any(UserNotification.class));
    }

    @Test(description = "notifyUser when user not found should throw ResourceNotFoundException")
    public void notifyUser_UserNotFound_ShouldThrow() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userNotificationService.notifyUser(999L, "TYPE", "Title", "Message", "/url"));
        verify(userNotificationRepository, never()).save(any());
    }

    @Test(description = "notifyAgent should create and save agent notification")
    public void notifyAgent_ValidAgent_ShouldSaveNotification() {
        Agent agent = Agent.builder().id(5L).agencyName("Dream Travels").build();

        userNotificationService.notifyAgent(agent, "NEW_BOOKING", "New Booking Request", "A tourist booked a package.");

        verify(agentNotificationRepository, times(1)).save(any(Notification.class));
    }

    @Test(description = "notifyAgent with null agent should do nothing")
    public void notifyAgent_NullAgent_ShouldNotSave() {
        userNotificationService.notifyAgent(null, "NEW_BOOKING", "Title", "Message");
        verify(agentNotificationRepository, never()).save(any());
    }

    @Test(description = "getUserNotifications should return list of notifications")
    public void getUserNotifications_ShouldReturnOrderedList() {
        User user = User.builder().id(10L).build();
        UserNotification n1 = new UserNotification();
        n1.setId(1L);
        n1.setUser(user);
        n1.setTitle("Booking Confirmed");
        n1.setMessage("Trip confirmed");
        n1.setRead(false);
        n1.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(userNotificationRepository.findByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(n1));

        List<UserNotificationResponse> responses = userNotificationService.getUserNotifications(10L);

        assertNotNull(responses);
        assertEquals(responses.size(), 1);
        assertEquals(responses.get(0).getTitle(), "Booking Confirmed");
        assertFalse(responses.get(0).getRead());
    }

    @Test(description = "getUnreadCount should return number of unread notifications")
    public void getUnreadCount_ShouldReturnCount() {
        when(userNotificationRepository.countByUserIdAndReadFalse(10L)).thenReturn(3L);

        long count = userNotificationService.getUnreadCount(10L);

        assertEquals(count, 3L);
        verify(userNotificationRepository, times(1)).countByUserIdAndReadFalse(10L);
    }

    @Test(description = "markAsRead should set notification read to true")
    public void markAsRead_ValidOwner_ShouldSetReadTrue() {
        User user = User.builder().id(10L).build();
        UserNotification n = new UserNotification();
        n.setId(1L);
        n.setUser(user);
        n.setRead(false);

        when(userNotificationRepository.findById(1L)).thenReturn(Optional.of(n));
        when(userNotificationRepository.save(any(UserNotification.class))).thenReturn(n);

        UserNotificationResponse response = userNotificationService.markAsRead(10L, 1L);

        assertNotNull(response);
        assertTrue(n.getRead());
        verify(userNotificationRepository, times(1)).save(n);
    }

    @Test(description = "markAsRead by different user should throw ResourceNotFoundException")
    public void markAsRead_NonOwner_ShouldThrowException() {
        User user = User.builder().id(10L).build();
        UserNotification n = new UserNotification();
        n.setId(1L);
        n.setUser(user);

        when(userNotificationRepository.findById(1L)).thenReturn(Optional.of(n));

        assertThrows(ResourceNotFoundException.class, () ->
                userNotificationService.markAsRead(999L, 1L));
        verify(userNotificationRepository, never()).save(any());
    }

    @Test(description = "markAllAsRead should mark all unread notifications as read")
    public void markAllAsRead_ShouldMarkAllAsRead() {
        User user = User.builder().id(10L).build();
        UserNotification n1 = new UserNotification();
        n1.setId(1L);
        n1.setUser(user);
        n1.setRead(false);

        UserNotification n2 = new UserNotification();
        n2.setId(2L);
        n2.setUser(user);
        n2.setRead(false);

        when(userNotificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(10L, false))
                .thenReturn(List.of(n1, n2));

        userNotificationService.markAllAsRead(10L);

        assertTrue(n1.getRead());
        assertTrue(n2.getRead());
        verify(userNotificationRepository, times(1)).saveAll(anyList());
    }
}
