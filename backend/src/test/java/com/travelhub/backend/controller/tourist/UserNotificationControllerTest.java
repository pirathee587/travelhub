package com.travelhub.backend.controller.tourist;

import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.controller.UserNotificationController;
import com.travelhub.backend.service.UserNotificationService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class UserNotificationControllerTest {

    @Mock
    private UserNotificationService userNotificationService;

    @InjectMocks
    private UserNotificationController userNotificationController;

    @AfterMethod
    public void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test(description = "GET /api/users/me/notifications without token should throw UnauthorizedException")
    public void getNotifications_Unauthenticated_ShouldThrowUnauthorized() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> userNotificationController.getNotifications());
        verify(userNotificationService, never()).getUserNotifications(any());
    }

    @Test(description = "GET /api/users/me/notifications/unread-count without token should throw UnauthorizedException")
    public void getUnreadCount_Unauthenticated_ShouldThrowUnauthorized() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> userNotificationController.getUnreadCount());
        verify(userNotificationService, never()).getUnreadCount(any());
    }

    @Test(description = "PATCH /api/users/me/notifications/{id}/read without token should throw UnauthorizedException")
    public void markAsRead_Unauthenticated_ShouldThrowUnauthorized() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> userNotificationController.markAsRead(1L));
        verify(userNotificationService, never()).markAsRead(any(), any());
    }

    @Test(description = "PATCH /api/users/me/notifications/read-all without token should throw UnauthorizedException")
    public void markAllAsRead_Unauthenticated_ShouldThrowUnauthorized() {
        SecurityContextHolder.clearContext();

        assertThrows(UnauthorizedException.class, () -> userNotificationController.markAllAsRead());
        verify(userNotificationService, never()).markAllAsRead(any());
    }
}
