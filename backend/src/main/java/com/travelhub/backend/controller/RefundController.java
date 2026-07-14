package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.request.RefundRequestDto;
import com.travelhub.backend.dto.response.RefundResponseDto;
import com.travelhub.backend.service.RefundRequestService;
import com.travelhub.backend.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RefundController {

    private final RefundRequestService refundRequestService;

    // Tourist endpoints
    @PostMapping("/api/tourist/bookings/{bookingId}/refund-request")
    public ResponseEntity<ApiResponse> requestRefund(
            @PathVariable Long bookingId,
            @Valid @RequestBody RefundRequestDto dto) {
        Long userId = requireCurrentUserId();
        RefundResponseDto response = refundRequestService.createRefundRequest(userId, bookingId, dto);
        return ResponseEntity.ok(new ApiResponse(true, "Refund request submitted successfully", response));
    }

    @GetMapping("/api/tourist/refund-requests")
    public ResponseEntity<List<RefundResponseDto>> getTouristRequests() {
        Long userId = requireCurrentUserId();
        return ResponseEntity.ok(refundRequestService.getTouristRefundRequests(userId));
    }

    // Agent endpoints
    @GetMapping("/api/v1/agent/refund-requests")
    public ResponseEntity<List<RefundResponseDto>> getAgentRequests() {
        Long agentOwnerUserId = requireCurrentUserId();
        return ResponseEntity.ok(refundRequestService.getAgentRefundRequests(agentOwnerUserId));
    }

    @PostMapping("/api/v1/agent/refund-requests/{requestId}/approve")
    public ResponseEntity<ApiResponse> approveRequest(
            @PathVariable Long requestId,
            @RequestParam("file") MultipartFile file) {
        Long agentOwnerUserId = requireCurrentUserId();
        RefundResponseDto response = refundRequestService.approveRefundRequest(agentOwnerUserId, requestId, file);
        return ResponseEntity.ok(new ApiResponse(true, "Refund request approved and processed", response));
    }

    @PostMapping("/api/v1/agent/refund-requests/{requestId}/decline")
    public ResponseEntity<ApiResponse> declineRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body) {
        Long agentOwnerUserId = requireCurrentUserId();
        String reason = body.getOrDefault("reason", "Declined by agent");
        RefundResponseDto response = refundRequestService.declineRefundRequest(agentOwnerUserId, requestId, reason);
        return ResponseEntity.ok(new ApiResponse(true, "Refund request declined", response));
    }

    private Long requireCurrentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
