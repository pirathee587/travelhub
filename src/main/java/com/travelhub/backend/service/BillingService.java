package com.travelhub.backend.service;

import com.travelhub.backend.dto.response.BillingHistoryResponse;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BillingService {

    private final PaymentRepository paymentRepository;

    public BillingService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public List<BillingHistoryResponse> getBillingHistory(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private BillingHistoryResponse toResponse(Payment payment) {
        BillingHistoryResponse response = new BillingHistoryResponse();
        response.setPaymentId(payment.getId());
        response.setTransactionId(payment.getTransactionId());
        response.setBookingId(payment.getBooking() != null ? payment.getBooking().getId() : null);
        response.setPackageName(payment.getBooking() != null && payment.getBooking().getPkg() != null
                ? payment.getBooking().getPkg().getPackageName() : "Travel Booking");
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setPaymentMethod("PayHere");
        response.setDate(payment.getCreatedAt() != null
                ? payment.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                : "");
        response.setReceiptAvailable("Completed".equalsIgnoreCase(payment.getStatus()));
        return response;
    }
}
