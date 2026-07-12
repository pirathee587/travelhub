package com.travelhub.backend.controller;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.dto.request.OwnerHotelRequest;
import com.travelhub.backend.dto.response.HotelResponse;
import com.travelhub.backend.dto.response.OwnerHotelSummaryResponse;
import com.travelhub.backend.service.OwnerAccessService;
import com.travelhub.backend.service.OwnerHotelService;
import com.travelhub.backend.util.OwnerContextResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/owner/hotels")
@RequiredArgsConstructor
public class OwnerHotelController {

    private final OwnerHotelService ownerHotelService;
    private final OwnerAccessService ownerAccessService;
    private final OwnerContextResolver ownerContextResolver;

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getOwnerHotels(
            @RequestParam(defaultValue = "Approved") String status,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerHotelService.getOwnerHotels(status, ownerId));
    }

    @GetMapping("/summary")
    public ResponseEntity<OwnerHotelSummaryResponse> getOwnerHotelSummary(
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerHotelService.getOwnerHotelSummary(ownerId));
    }

    @PostMapping
    public ResponseEntity<HotelResponse> createHotel(
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerHotelService.createHotel(request, hotelImage, ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HotelResponse> updateHotel(
            @PathVariable Long id,
            @ModelAttribute OwnerHotelRequest request,
            @RequestParam(value = "hotelImage", required = false) MultipartFile hotelImage,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        return ResponseEntity.ok(ownerHotelService.updateHotel(id, request, hotelImage, ownerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(
            @PathVariable Long id,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        ownerAccessService.validateApprovedActiveHotelOwner(ownerId);
        ownerHotelService.deleteHotel(id, ownerId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/suspend")
    public ResponseEntity<HotelResponse> suspendHotel(
            @PathVariable Long id,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        return ResponseEntity.ok(ownerHotelService.suspendHotel(id, ownerId));
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<HotelResponse> reactivateHotel(
            @PathVariable Long id,
            @RequestHeader(value = "X-Owner-Id", required = false) Long devOwnerId) {
        Long ownerId = requireOwnerId(devOwnerId);
        return ResponseEntity.ok(ownerHotelService.reactivateHotel(id, ownerId));
    }

    private Long requireOwnerId(Long devOwnerId) {
        Long ownerId = ownerContextResolver.resolveOwnerId(devOwnerId);
        if (ownerId == null) {
            throw new BadRequestException("No owner identity provided. Set X-Owner-Id header or authenticate.");
        }
        return ownerId;
    }
}
