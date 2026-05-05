package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.RegisterRequest;
import com.travelhub.backend.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse> createAdmin(@Valid @RequestBody RegisterRequest request) {
        ApiResponse response = adminUserService.createAdminUser(request);
        return ResponseEntity.ok(response);
    }
}