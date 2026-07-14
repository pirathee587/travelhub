package com.travelhub.backend.controller.admin;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.response.AdminUserResponse;
import com.travelhub.backend.service.AdminUserService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AdminUserControllerTest {

    @Mock
    private AdminUserService adminUserService;

    @InjectMocks
    private com.travelhub.backend.controller.AdminUserController adminUserController;

    @Test(description = "GET /api/admin/users should return 200 with ApiResponse wrapping user list")
    public void getAllUsers_ShouldReturn200_WithUserList() {
        AdminUserResponse u1 = new AdminUserResponse(1L, "Alice", "alice@mail.com", "TOURIST", "0771111111", true, false, "2024-01-01");
        AdminUserResponse u2 = new AdminUserResponse(2L, "Bob",   "bob@mail.com",   "AGENT",   "0772222222", true, true,  "2024-01-02");
        when(adminUserService.getAllUsers()).thenReturn(List.of(u1, u2));

        var response = adminUserController.getAllUsers();

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());

        // Body is ApiResponse — cast and verify
        ApiResponse body = (ApiResponse) response.getBody();
        assertTrue(body.isSuccess());
        verify(adminUserService, times(1)).getAllUsers();
    }

    @Test(description = "GET /api/admin/users/{id} should return 200 for valid user")
    public void getUserById_ShouldReturn200_WhenUserExists() {
        AdminUserResponse user = new AdminUserResponse(1L, "Alice", "alice@mail.com", "TOURIST", "0771111111", true, false, "2024-01-01");
        when(adminUserService.getUserById(1L)).thenReturn(user);

        var response = adminUserController.getUserById(1L);

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        verify(adminUserService, times(1)).getUserById(1L);
    }
}
