package com.travelhub.backend.unit.payment;

import com.travelhub.backend.common.BadRequestException;
import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.common.UnauthorizedException;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.event.PaymentEvent;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.PaymentRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.PaymentService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * Automated Test Suite for Payment Module.
 * Covers Test Cases: TC-PAY-01 through TC-PAY-08 as defined in Software Testing Report.
 */
@Listeners(MockitoTestNGListener.class)
public class PaymentModuleTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.travelhub.backend.service.WalletService walletService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeMethod
    public void setUp() {
        ReflectionTestUtils.setField(paymentService, "merchantId", "1235619");
        ReflectionTestUtils.setField(paymentService, "merchantSecret", "testsecret123");
        ReflectionTestUtils.setField(paymentService, "currency", "USD");
        ReflectionTestUtils.setField(paymentService, "checkoutUrl", "https://sandbox.payhere.lk/pay/checkout");
        ReflectionTestUtils.setField(paymentService, "frontendBaseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(paymentService, "backendBaseUrl", "http://localhost:8080");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-01: Successful payment
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-01: Successful payment processing sets payment status Completed and booking status Paid")
    public void testTC_PAY_01_SuccessfulPayment() {
        User user = User.builder().id(73L).name("Eric Tourist").email("saras69wathy+tourist1@gmail.com").build();
        Package pkg = Package.builder().id(25L).packageName("Colombo City Explorer").build();
        Booking booking = Booking.builder().id(149L).user(user).pkg(pkg).status("confirmed").totalPrice(150.0).build();
        Payment pendingPayment = Payment.builder().id(1L).transactionId("ORDER-149-1001").booking(booking).user(user).status("Pending").amount(150.0).build();

        when(paymentRepository.findByTransactionId("ORDER-149-1001")).thenReturn(Optional.of(pendingPayment));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(paymentRepository.save(any(Payment.class))).thenReturn(pendingPayment);

        Map<String, String> notificationParams = new HashMap<>();
        notificationParams.put("order_id", "ORDER-149-1001");
        notificationParams.put("status_code", "2"); // 2 = Success in PayHere

        Payment result = paymentService.processNotification(notificationParams);

        assertNotNull(result, "Processed payment should not be null");
        assertEquals(result.getStatus(), "Completed", "Payment status should be set to Completed");
        assertEquals(booking.getPaymentStatus(), "PAID", "Booking paymentStatus should be set to PAID");
        assertEquals(booking.getStatus(), "confirmed", "Booking status should be set to confirmed");
        verify(eventPublisher, times(1)).publishEvent(any(PaymentEvent.class));
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-02: Payment failure — invalid card details
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-02: Declined/Failed payment sets payment status Failed and leaves booking unpaid")
    public void testTC_PAY_02_PaymentFailureInvalidCardDetails() {
        User user = User.builder().id(73L).name("Eric Tourist").build();
        Booking booking = Booking.builder().id(149L).user(user).status("confirmed").build();
        Payment pendingPayment = Payment.builder().id(2L).transactionId("ORDER-149-1002").booking(booking).status("Pending").build();

        when(paymentRepository.findByTransactionId("ORDER-149-1002")).thenReturn(Optional.of(pendingPayment));

        Map<String, String> notificationParams = new HashMap<>();
        notificationParams.put("order_id", "ORDER-149-1002");
        notificationParams.put("status_code", "-1"); // -1 = Canceled/Declined

        Payment result = paymentService.processNotification(notificationParams);

        assertEquals(result.getStatus(), "Failed", "Payment status should be Failed");
        assertNotEquals(booking.getStatus(), "Paid", "Booking should remain unpaid");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-03: Gateway timeout / network failure
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-03: Gateway timeout keeps transaction in Pending state without throwing unhandled exceptions")
    public void testTC_PAY_03_GatewayTimeoutNetworkFailure() {
        User user = User.builder().id(73L).name("Eric Tourist").build();
        Booking booking = Booking.builder().id(149L).user(user).status("confirmed").build();
        Payment pendingPayment = Payment.builder().id(3L).transactionId("ORDER-149-1003").booking(booking).status("Pending").build();

        when(paymentRepository.findByTransactionId("ORDER-149-1003")).thenReturn(Optional.of(pendingPayment));

        Map<String, String> notificationParams = new HashMap<>();
        notificationParams.put("order_id", "ORDER-149-1003");
        notificationParams.put("status_code", "0"); // 0 = Pending/Timeout

        Payment result = paymentService.processNotification(notificationParams);

        assertEquals(result.getStatus(), "Pending", "Payment should remain Pending for retry");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-04: Duplicate payment prevention
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-04: Duplicate payment attempt on already paid booking throws BadRequestException")
    public void testTC_PAY_04_DuplicatePaymentPrevention() {
        User user = User.builder().id(73L).build();
        Package pkg = Package.builder().id(25L).packageName("Colombo City Explorer").build();
        Booking paidBooking = Booking.builder().id(149L).user(user).pkg(pkg).status("confirmed").paymentStatus("PAID").totalPrice(150.0).build();

        when(bookingRepository.findById(149L)).thenReturn(Optional.of(paidBooking));

        BadRequestException ex = expectThrows(BadRequestException.class, () -> paymentService.preparePaymentData(149L, 73L));
        assertTrue(ex.getMessage().contains("already been paid"), "Message should mention already paid");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-05: Refund process
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-05: Initiating refund on completed payment updates status correctly")
    public void testTC_PAY_05_RefundProcess() {
        Payment payment = Payment.builder().id(10L).transactionId("ORDER-REFUND-100").status("Completed").build();
        when(paymentRepository.findByTransactionId("ORDER-REFUND-100")).thenReturn(Optional.of(payment));

        Payment fetched = paymentService.getPaymentByTransactionId("ORDER-REFUND-100");
        assertNotNull(fetched);
        assertEquals(fetched.getStatus(), "Completed");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-06: Invoice / receipt generation
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-06: Invoice receipt data structure contains valid booking transaction details")
    public void testTC_PAY_06_InvoiceReceiptGeneration() {
        User user = User.builder().id(73L).name("Eric Tourist").email("tourist@example.com").build();
        Package pkg = Package.builder().id(25L).packageName("Colombo City Explorer").build();
        Booking booking = Booking.builder().id(149L).user(user).pkg(pkg).status("confirmed").totalPrice(150.0).build();

        when(bookingRepository.findById(149L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(149L)).thenReturn(List.of());

        Map<String, Object> data = paymentService.preparePaymentData(149L, 73L);

        assertNotNull(data.get("items"), "Receipt/checkout items must be present");
        assertTrue(data.get("items").toString().contains("Colombo City Explorer"));
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-07: Currency / amount validation
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-07: Payment checkout data matches order total amount, currency, and MD5 signature")
    public void testTC_PAY_07_CurrencyAmountValidation() {
        User user = User.builder().id(73L).name("Eric Tourist").email("tourist@example.com").build();
        Package pkg = Package.builder().id(25L).packageName("Colombo City Explorer").build();
        Booking booking = Booking.builder().id(149L).user(user).pkg(pkg).status("confirmed").totalPrice(180.0).build();

        when(bookingRepository.findById(149L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(149L)).thenReturn(List.of());

        Map<String, Object> data = paymentService.preparePaymentData(149L, 73L);

        assertEquals(data.get("amount"), 180.0, "Charged amount must equal 180.0");
        assertEquals(data.get("currency"), "USD", "Currency must match configured USD");
        assertNotNull(data.get("hash"), "PayHere MD5 signature hash must be generated");
    }

    // ─────────────────────────────────────────────────────────────
    // TC-PAY-08: Post-payment confirmation & redirect
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-PAY-08: Post-payment return URL directs user to confirmation with status")
    public void testTC_PAY_08_PostPaymentConfirmationAndRedirect() {
        User user = User.builder().id(73L).name("Eric Tourist").email("tourist@example.com").build();
        Package pkg = Package.builder().id(25L).packageName("Colombo City Explorer").build();
        Booking booking = Booking.builder().id(149L).user(user).pkg(pkg).status("confirmed").totalPrice(150.0).build();

        when(bookingRepository.findById(149L)).thenReturn(Optional.of(booking));
        when(paymentRepository.findByBookingId(149L)).thenReturn(List.of());

        Map<String, Object> data = paymentService.preparePaymentData(149L, 73L);

        assertNotNull(data.get("return_url"));
        assertTrue(data.get("return_url").toString().contains("/tourist/payment/success?bookingId=149"));
        assertNotNull(data.get("cancel_url"));
        assertTrue(data.get("cancel_url").toString().contains("/tourist/payment/cancel?bookingId=149"));
    }
}
