package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponseDto {
    private Long agentId;
    private String agencyName;
    private Double availableBalance;
    private Double pendingEscrowBalance;
    private Double totalWithdrawn;
    private Double platformCommissionRate; // 5.0%
    private List<WalletTransactionDto> recentTransactions;
}
