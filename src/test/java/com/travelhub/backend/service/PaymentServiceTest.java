package com.travelhub.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PaymentServiceTest {

    @Test
    void testHashGeneration() {
        PaymentService paymentService = new PaymentService(null, null);
        ReflectionTestUtils.setField(paymentService, "merchantId", "1211149");
        ReflectionTestUtils.setField(paymentService, "merchantSecret", "TEST_SECRET");
        ReflectionTestUtils.setField(paymentService, "currency", "LKR");

        String orderId = "ORDER-123";
        double amount = 1000.00;

        // md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
        // amount must be formatted to 0.00
        
        // Manual calculation simulation
        // secretHash = md5("TEST_SECRET").toUpperCase()
        // mainString = "1211149" + "ORDER-123" + "1000.00" + "LKR" + secretHash
        // expectedHash = md5(mainString).toUpperCase()

        // We'll just check if it returns a non-null 32-char hex string
        String hash = (String) ReflectionTestUtils.invokeMethod(paymentService, "generateHash", orderId, amount);
        
        assertNotNull(hash);
        assertEquals(32, hash.length());
        System.out.println("Generated Hash: " + hash);
    }

    @Test
    void testNotificationVerification() {
        PaymentService paymentService = new PaymentService(null, null);
        ReflectionTestUtils.setField(paymentService, "merchantId", "1211149");
        ReflectionTestUtils.setField(paymentService, "merchantSecret", "TEST_SECRET");

        Map<String, String> params = new HashMap<>();
        params.put("merchant_id", "1211149");
        params.put("order_id", "ORDER-123");
        params.put("payhere_amount", "1000.00");
        params.put("payhere_currency", "LKR");
        params.put("status_code", "2");
        
        // Generate the signature manually for the test
        // md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret))
        String secretHash = "ff3fffaf71f89713c2629a89ea4c3623".toUpperCase(); // md5("TEST_SECRET")
        String mainString = "1211149" + "ORDER-123" + "1000.00" + "LKR" + "2" + secretHash;
        String expectedSig = "EB2441A3B248101083B904805054D769"; // md5(mainString)
        
        params.put("md5sig", expectedSig);

        assertTrue(paymentService.verifyNotification(params));
    }
}
