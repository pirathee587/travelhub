package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    /**
     * Prepares data for PayHere Checkout
     */
    public Map<String, Object> preparePaymentData(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        String orderId = "ORDER-" + booking.getId() + "-" + System.currentTimeMillis();
        double amount = booking.getTotalPrice();

        // Save initial payment record as Pending
        Payment payment = new Payment();
        payment.setTransactionId(orderId);
        payment.setBooking(booking);
        payment.setUser(booking.getUser());
        payment.setType("Payment");
        payment.setAmount(amount);
        payment.setStatus("Pending");
        paymentRepository.save(payment);

        String hash = generateHash(orderId, amount);

        Map<String, Object> data = new HashMap<>();
        data.put("merchant_id", merchantId);
        data.put("order_id", orderId);
        data.put("items", "Booking for " + booking.getPkg().getPackageName());
        data.put("amount", amount);
        data.put("currency", currency);
        data.put("hash", hash);
        data.put("first_name", booking.getUser().getName());
        data.put("last_name", ""); // User entity might only have 'name'
        data.put("email", booking.getUser().getEmail());
        data.put("phone", ""); // Optional
        data.put("address", ""); // Optional
        data.put("city", ""); // Optional
        data.put("country", "Sri Lanka");

        return data;
    }

    /**
     * Logic: md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
     */
    private String generateHash(String orderId, double amount) {
        DecimalFormat df = new DecimalFormat("0.00");
        String amountFormatted = df.format(amount);
        String secretHash = md5(merchantSecret).toUpperCase();
        String mainString = merchantId + orderId + amountFormatted + currency + secretHash;
        return md5(mainString).toUpperCase();
    }

    /**
     * Logic: md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret))
     */
    public boolean verifyNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String md5sig = params.get("md5sig");

        String secretHash = md5(merchantSecret).toUpperCase();
        String mainString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash;
        System.out.println("DEBUG mainString: " + mainString);
        String calculatedSig = md5(mainString).toUpperCase();
        System.out.println("DEBUG calculatedSig: " + calculatedSig);
        System.out.println("DEBUG receivedSig: " + md5sig);

        return calculatedSig.equals(md5sig);
    }

    @Transactional
    public void processNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        int statusCode = Integer.parseInt(params.get("status_code"));

        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(orderId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setMethod(params.get("method"));
            payment.setPayhereAmount(Double.parseDouble(params.get("payhere_amount")));
            payment.setPayhereCurrency(params.get("payhere_currency"));
            payment.setStatusCode(statusCode);
            payment.setMd5sig(params.get("md5sig"));

            if (statusCode == 2) {
                payment.setStatus("Completed");
                // Update booking status as well
                Booking booking = payment.getBooking();
                booking.setStatus("Paid");
                bookingRepository.save(booking);
            } else if (statusCode == 0) {
                payment.setStatus("Pending");
            } else {
                payment.setStatus("Failed");
            }
            paymentRepository.save(payment);
        }
    }

    private String md5(String input) {
        return org.springframework.util.DigestUtils.md5DigestAsHex(input.getBytes(StandardCharsets.UTF_8));
    }
}
