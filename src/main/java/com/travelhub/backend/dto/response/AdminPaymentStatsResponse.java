package com.travelhub.backend.dto.response;

public record AdminPaymentStatsResponse(
        Double totalRevenue,
        Double pendingAmount,
        Long   pendingCount,
        Double totalRefunds
) {}