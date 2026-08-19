package com.travelhub.backend.unit.email;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Package;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailLogService;
import com.travelhub.backend.service.EmailService;
import com.travelhub.backend.service.EmailTemplateBuilder;
import jakarta.mail.internet.MimeMessage;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * Automated Test Suite for Email Notification Module.
 * Covers Test Cases: TC-EMAIL-01 through TC-EMAIL-06 as defined in Software Testing Report.
 */
@Listeners(MockitoTestNGListener.class)
public class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailLogService emailLogService;

    @Mock
    private UserRepository userRepository;

    private EmailService emailService;

    @Mock
    private MimeMessage mimeMessage;

    @BeforeMethod
    public void setUp() {
        EmailTemplateBuilder templateBuilder = new EmailTemplateBuilder();
        ReflectionTestUtils.setField(templateBuilder, "baseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(templateBuilder, "emailLogoUrl", "https://travelhublanka.netlify.app/TravelHUB.png");
        ReflectionTestUtils.setField(templateBuilder, "supportEmail", "hello@travelhub.lk");

        emailService = new EmailService(mailSender, emailLogService, userRepository, templateBuilder);
        ReflectionTestUtils.setField(emailService, "baseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(emailService, "backendUrl", "http://localhost:8080");

        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-01: Registration confirmation email
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-01: Registration confirmation email is constructed and sent via SMTP")
    public void testTC_EMAIL_01_RegistrationConfirmationEmail() {
        User user = User.builder().id(10L).email("newtourist@example.com").name("New Tourist").build();
        when(userRepository.findByEmail("newtourist@example.com")).thenReturn(Optional.of(user));

        emailService.sendVerificationEmail("newtourist@example.com", "uuid-verification-token-123");

        verify(mailSender, times(1)).send(any(MimeMessage.class));
        verify(emailLogService, times(1)).logSent(
                eq("newtourist@example.com"),
                eq("Verify your email - TravelHub"),
                argThat(content -> content.contains("uuid-verification-token-123")
                        && content.contains("https://travelhublanka.netlify.app/TravelHUB.png")),
                eq("USER"),
                eq(10L)
        );
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-02: Email delivery timing
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-02: Email delivery timing executes under benchmark threshold")
    public void testTC_EMAIL_02_EmailDeliveryTiming() {
        User user = User.builder().id(15L).email("timinguser@example.com").build();
        when(userRepository.findByEmail("timinguser@example.com")).thenReturn(Optional.of(user));

        long startTime = System.currentTimeMillis();
        emailService.sendVerificationEmail("timinguser@example.com", "quick-token");
        long duration = System.currentTimeMillis() - startTime;

        assertTrue(duration < 2000, "Email dispatch preparation should take less than 2 seconds (was " + duration + " ms)");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-03: Password reset email content & link validity
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-03: Password reset email contains valid UUID reset link")
    public void testTC_EMAIL_03_PasswordResetEmailContentAndLinkValidity() {
        String resetToken = "550e8400-e29b-41d4-a716-446655440000";
        User user = User.builder().id(22L).email("resettest@example.com").build();
        when(userRepository.findByEmail("resettest@example.com")).thenReturn(Optional.of(user));

        emailService.sendPasswordResetEmail("resettest@example.com", resetToken);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
        verify(emailLogService, times(1)).logSent(
                eq("resettest@example.com"),
                eq("Reset your password - TravelHub"),
                contains("reset-password?token=" + resetToken),
                eq("USER"),
                eq(22L)
        );
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-04: Payment confirmation email
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-04: Payment confirmation email sent with accurate transaction details")
    public void testTC_EMAIL_04_PaymentConfirmationEmail() {
        User tourist = User.builder().id(30L).email("payer@example.com").name("Paying Tourist").build();
        Package pkg = Package.builder().id(5L).packageName("Colombo City Explorer").build();
        Booking booking = Booking.builder().id(149L).pkg(pkg).user(tourist).build();
        Payment payment = Payment.builder()
                .id(88L)
                .transactionId("ORDER-149-999")
                .amount(150.0)
                .status("Completed")
                .user(tourist)
                .booking(booking)
                .build();

        emailService.sendPaymentConfirmation(payment);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
        verify(emailLogService, times(1)).logSent(
                eq("payer@example.com"),
                eq("Payment Confirmation - TravelHub"),
                contains("ORDER-149-999"),
                eq("PAYMENT"),
                eq(88L)
        );
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-05: Failed transaction notification handling
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-05: Failed payment does not dispatch positive payment confirmation email")
    public void testTC_EMAIL_05_FailedTransactionHandling() {
        Payment failedPayment = Payment.builder()
                .id(99L)
                .transactionId("ORDER-FAILED-001")
                .amount(150.0)
                .status("Failed")
                .user(null) // Unbound or null user for failed attempts
                .build();

        emailService.sendPaymentConfirmation(failedPayment);

        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(emailLogService, never()).logSent(anyString(), anyString(), anyString(), anyString(), anyLong());
    }

    // ─────────────────────────────────────────────────────────────
    // TC-EMAIL-06: Resend email / notification
    // ─────────────────────────────────────────────────────────────
    @Test(description = "TC-EMAIL-06: Resending notification dispatches fresh token without breaking prior state")
    public void testTC_EMAIL_06_ResendEmailNotification() {
        User user = User.builder().id(44L).email("resenduser@example.com").build();
        when(userRepository.findByEmail("resenduser@example.com")).thenReturn(Optional.of(user));

        emailService.sendVerificationEmail("resenduser@example.com", "first-token-111");
        emailService.sendVerificationEmail("resenduser@example.com", "second-token-222");

        verify(mailSender, times(2)).send(any(MimeMessage.class));
        verify(emailLogService, times(2)).logSent(eq("resenduser@example.com"), anyString(), anyString(), eq("USER"), eq(44L));
    }
}
