package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminFinanceStatsResponse {
    private Double totalGrossMarketplaceVolume; // GMV
    private Double totalPlatformCommissionRevenue; // 5% earned
    private Double totalPlatformCancellationFees; // 20% of late cancellation fees
    private Double totalPlatformNetRevenue; // Commission + Cancellation fees
    private Double totalPendingAgencyEscrow; // Currently held for active trips
    private Double totalAgencyPayoutsCompleted; // Lifetime paid out
    private Long pendingPayoutRequestsCount; // Requests awaiting approval
}
