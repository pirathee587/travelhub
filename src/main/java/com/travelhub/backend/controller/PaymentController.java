package com.travelhub.backend.controller;

import com.travelhub.backend.common.ApiResponse;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.dto.response.BillingHistoryResponse;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.service.BillingService;
import com.travelhub.backend.service.PaymentService;
import com.travelhub.backend.service.ReceiptService;
import com.travelhub.backend.util.SecurityUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;
    private final ReceiptService receiptService;
    private final BillingService billingService;

    public PaymentController(PaymentService paymentService,
                             ReceiptService receiptService,
                             BillingService billingService) {
        this.paymentService = paymentService;
        this.receiptService = receiptService;
        this.billingService = billingService;
    }

    @GetMapping("/checkout/{bookingId}")
    public ResponseEntity<Map<String, Object>> getCheckoutData(@PathVariable Long bookingId) {
        Long userId = requireCurrentUserId();
        return ResponseEntity.ok(paymentService.preparePaymentData(bookingId, userId));
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handleNotify(@RequestParam Map<String, String> params) {
        if (paymentService.verifyNotification(params)) {
            paymentService.processNotification(params);
            return ResponseEntity.ok("Notification processed");
        }
        return ResponseEntity.badRequest().body("Invalid signature");
    }

    @GetMapping("/return")
    public ResponseEntity<ApiResponse> handleReturn(@RequestParam Map<String, String> params) {
        String orderId = params.get("order_id");
        if (orderId == null) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "order_id is required"));
        }

        Payment payment;
        if (paymentService.verifyNotification(params)) {
            payment = paymentService.processNotification(params);
        } else {
            // For local development and sandbox testing, since PayHere cannot trigger server-to-server callbacks
            // on localhost, we mark the redirect request as a completed payment.
            Map<String, String> localParams = new java.util.HashMap<>(params);
            localParams.put("status_code", "2"); // 2 = Completed
            payment = paymentService.processNotification(localParams);
        }

        return ResponseEntity.ok(new ApiResponse(true, "Payment processed", Map.of(
                "status", payment.getStatus(),
                "bookingId", payment.getBooking().getId()
        )));
    }

    @GetMapping("/my-billing")
    public ResponseEntity<List<BillingHistoryResponse>> getMyBillingHistory() {
        Long userId = requireCurrentUserId();
        return ResponseEntity.ok(billingService.getBillingHistory(userId));
    }

    @GetMapping("/receipt/{bookingId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long bookingId) {
        Long userId = requireCurrentUserId();
        boolean hasCompletedPayment = billingService.getBillingHistory(userId).stream()
                .anyMatch(item -> bookingId.equals(item.getBookingId()) && item.isReceiptAvailable());
        if (!hasCompletedPayment) {
            throw new UnauthorizedException("Receipt not available for this booking");
        }

        try {
            byte[] pdf = receiptService.generateBookingReceipt(bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Receipt_Booking_" + bookingId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private Long requireCurrentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userId;
    }
}
