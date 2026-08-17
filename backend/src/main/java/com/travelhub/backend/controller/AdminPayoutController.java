package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.response.AdminFinanceStatsResponse;
import com.travelhub.backend.dto.response.PayoutResponseDto;
import com.travelhub.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payouts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPayoutController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllPayoutRequests(@RequestParam(required = false) String status) {
        List<PayoutResponseDto> payouts = walletService.getAllPayoutRequests(status);
        return ResponseEntity.ok(new ApiResponse(true, "Payout requests fetched", payouts));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getFinanceStats() {
        AdminFinanceStatsResponse stats = walletService.getAdminFinanceStats();
        return ResponseEntity.ok(new ApiResponse(true, "Admin finance stats fetched", stats));
    }

    @PatchMapping(value = "/{id}/approve", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> approvePayout(
            @PathVariable Long id,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        PayoutResponseDto dto = walletService.approvePayout(id, file);
        return ResponseEntity.ok(new ApiResponse(true, "Payout request approved", dto));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse> rejectPayout(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Payout request rejected by admin");
        PayoutResponseDto dto = walletService.rejectPayout(id, reason);
        return ResponseEntity.ok(new ApiResponse(true, "Payout request rejected", dto));
    }
}
