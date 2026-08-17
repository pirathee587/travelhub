package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.dto.request.PayoutRequestDto;
import com.travelhub.backend.dto.response.PayoutResponseDto;
import com.travelhub.backend.dto.response.WalletResponseDto;
import com.travelhub.backend.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency/wallet")
@RequiredArgsConstructor
public class AgentWalletController {

    private final WalletService walletService;

    @GetMapping("/{agentUserId}")
    public ResponseEntity<ApiResponse> getWallet(@PathVariable Long agentUserId) {
        WalletResponseDto wallet = walletService.getAgencyWalletResponse(agentUserId);
        return ResponseEntity.ok(new ApiResponse(true, "Wallet fetched successfully", wallet));
    }

    @GetMapping("/{agentUserId}/payouts")
    public ResponseEntity<ApiResponse> getPayoutRequests(@PathVariable Long agentUserId) {
        List<PayoutResponseDto> payouts = walletService.getAgencyPayoutRequests(agentUserId);
        return ResponseEntity.ok(new ApiResponse(true, "Payout requests fetched successfully", payouts));
    }

    @PostMapping("/{agentUserId}/payouts")
    public ResponseEntity<ApiResponse> requestPayout(
            @PathVariable Long agentUserId,
            @Valid @RequestBody PayoutRequestDto dto) {
        PayoutResponseDto payout = walletService.requestPayout(agentUserId, dto);
        return ResponseEntity.ok(new ApiResponse(true, "Payout request submitted successfully", payout));
    }
}
