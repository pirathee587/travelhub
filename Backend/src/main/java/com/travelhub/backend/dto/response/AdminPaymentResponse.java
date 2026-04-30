package com.travelhub.backend.dto.response;

public record AdminPaymentResponse(
        Long   id,
        String transactionId,
        String bookingRef,
        String bookingDate,
        String touristName,
        String agentName,
        String type,
        Double amount,
        String status
) {}
