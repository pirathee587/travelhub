package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutResponseDto {
    private Long id;
    private Long agentId;
    private String agencyName;
    private Double amount;
    private String bankName;
    private String accountNo;
    private String accountHolderName;
    private String branchName;
    private String status; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private String transferSlipUrl;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
