package com.travelhub.backend.service;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.event.PaymentEvent;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.eventPublisher = eventPublisher;
    }

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Value("${payhere.currency}")
    private String currency;

    @Value("${payhere.checkout.url:https://sandbox.payhere.lk/pay/checkout}")
    private String checkoutUrl;

    @Value("${app.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendBaseUrl;

    @Transactional
    public Map<String, Object> preparePaymentData(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to pay for this booking");
        }

        if (!"active".equalsIgnoreCase(booking.getStatus())) {
            if ("Paid".equalsIgnoreCase(booking.getStatus())) {
                throw new BadRequestException("This booking has already been paid");
            }
            throw new BadRequestException("Payment is only available after the agent approves your booking");
        }

        boolean alreadyPaid = paymentRepository.findByBookingId(bookingId).stream()
                .anyMatch(p -> "Completed".equalsIgnoreCase(p.getStatus()));
        if (alreadyPaid) {
            throw new BadRequestException("This booking has already been paid");
        }

        String orderId = "ORDER-" + booking.getId() + "-" + System.currentTimeMillis();
        double amount = booking.getTotalPrice();

        Payment payment = new Payment();
        payment.setTransactionId(orderId);
        payment.setBooking(booking);
        payment.setUser(booking.getUser());
        if (booking.getVehicle() != null && booking.getVehicle().getAgent() != null) {
            payment.setAgent(booking.getVehicle().getAgent());
        }
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
        data.put("last_name", "");
        data.put("email", booking.getUser().getEmail());
        data.put("phone", booking.getUser().getTelephone() != null ? booking.getUser().getTelephone() : "");
        data.put("address", "");
        data.put("city", "");
        data.put("country", "Sri Lanka");
        data.put("checkout_url", checkoutUrl);
        data.put("return_url", frontendBaseUrl + "/payment-success?bookingId=" + bookingId);
        data.put("cancel_url", frontendBaseUrl + "/payment-cancel?bookingId=" + bookingId);
        data.put("notify_url", backendBaseUrl + "/api/payments/notify");
        return data;
    }

    private String generateHash(String orderId, double amount) {
        DecimalFormat df = new DecimalFormat("0.00");
        String amountFormatted = df.format(amount);
        String secretHash = md5(merchantSecret).toUpperCase();
        String mainString = merchantId + orderId + amountFormatted + currency + secretHash;
        return md5(mainString).toUpperCase();
    }

    public boolean verifyNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        String payhereAmount = params.get("payhere_amount");
        String payhereCurrency = params.get("payhere_currency");
        String statusCode = params.get("status_code");
        String md5sig = params.get("md5sig");

        if (orderId == null || payhereAmount == null || payhereCurrency == null || statusCode == null || md5sig == null) {
            return false;
        }

        String secretHash = md5(merchantSecret).toUpperCase();
        String mainString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash;
        String calculatedSig = md5(mainString).toUpperCase();
        return calculatedSig.equalsIgnoreCase(md5sig);
    }

    @Transactional
    public Payment processNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        int statusCode = Integer.parseInt(params.get("status_code"));

        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(orderId);
        if (paymentOpt.isEmpty()) {
            throw new ResourceNotFoundException("Payment", "transactionId", orderId);
        }

        Payment payment = paymentOpt.get();
        if ("Completed".equalsIgnoreCase(payment.getStatus())) {
            return payment;
        }

        payment.setMethod(params.get("method"));
        payment.setPayhereAmount(Double.parseDouble(params.get("payhere_amount")));
        payment.setPayhereCurrency(params.get("payhere_currency"));
        payment.setStatusCode(statusCode);
        payment.setMd5sig(params.get("md5sig"));

        if (statusCode == 2) {
            payment.setStatus("Completed");
            Booking booking = payment.getBooking();
            booking.setStatus("Paid");
            bookingRepository.save(booking);
            paymentRepository.save(payment);
            eventPublisher.publishEvent(new PaymentEvent(this, payment, "COMPLETED"));
        } else if (statusCode == 0) {
            payment.setStatus("Pending");
            paymentRepository.save(payment);
        } else {
            payment.setStatus("Failed");
            paymentRepository.save(payment);
            eventPublisher.publishEvent(new PaymentEvent(this, payment, "FAILED"));
        }

        return payment;
    }

    private String md5(String input) {
        return org.springframework.util.DigestUtils.md5DigestAsHex(input.getBytes(StandardCharsets.UTF_8));
    }
}
