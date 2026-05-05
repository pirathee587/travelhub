package com.travelhub.backend.controller;

import com.travelhub.backend.service.PaymentService;
import com.travelhub.backend.service.ReceiptService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;
    private final ReceiptService receiptService;

    public PaymentController(PaymentService paymentService, ReceiptService receiptService) {
        this.paymentService = paymentService;
        this.receiptService = receiptService;
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

    /**
     * Endpoint for downloading the receipt
     */
    @GetMapping("/receipt/{bookingId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long bookingId) {
        try {
            byte[] pdf = receiptService.generateBookingReceipt(bookingId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Receipt_Booking_" + bookingId + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
