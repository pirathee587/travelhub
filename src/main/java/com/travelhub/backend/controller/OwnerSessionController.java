package com.travelhub.backend.controller;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.response.OwnerSessionResponse;
import com.travelhub.backend.service.OwnerAccessService;
import com.travelhub.backend.util.OwnerContextResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/owner/session")
@RequiredArgsConstructor
public class OwnerSessionController {

    private final OwnerAccessService ownerAccessService;
    private final OwnerContextResolver ownerContextResolver;

    @GetMapping
    public ResponseEntity<OwnerSessionResponse> getSession(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) {
            throw new BadRequestException("No owner identity provided. Set X-Owner-Id header or authenticate.");
        }
        return ResponseEntity.ok(ownerAccessService.getSession(ownerId));
    }
}
