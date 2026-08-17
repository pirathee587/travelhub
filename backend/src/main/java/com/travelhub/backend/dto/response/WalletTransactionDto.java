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
public class WalletTransactionDto {
    private Long id;
    private Long bookingId;
    private String type; // TRIP_COMPLETED_CREDIT, COMMISSION_DEDUCTION, CANCELLATION_COMPENSATION, PAYOUT_WITHDRAWAL
    private Double amount;
    private String description;
    private LocalDateTime createdAt;
}
