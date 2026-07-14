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
public class RefundResponseDto {
    private Long id;
    private Long bookingId;
    private String packageName;
    private String touristName;
    private Double amount;
    private String bankName;
    private String accountNo;
    private String accountHolderName;
    private String branchName;
    private String reason;
    private String status;
    private String refundSlipUrl;
    private LocalDateTime createdAt;
}
