package com.travelhub.backend.controller;

import com.travelhub.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Endpoint for frontend to get PayHere parameters for a booking
     */
    @GetMapping("/checkout/{bookingId}")
    public ResponseEntity<Map<String, Object>> getCheckoutData(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.preparePaymentData(bookingId));
    }

    /**
     * Endpoint for PayHere IPN (Notification)
     * Must be publicly accessible
     */
    @PostMapping("/notify")
    public ResponseEntity<String> handleNotify(@RequestParam Map<String, String> params) {
        if (paymentService.verifyNotification(params)) {
            paymentService.processNotification(params);
            return ResponseEntity.ok("Notification processed");
        } else {
            return ResponseEntity.badRequest().body("Invalid signature");
        }
    }
}
