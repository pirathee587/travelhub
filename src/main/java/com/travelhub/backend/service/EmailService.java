package com.travelhub.backend.service;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogService emailLogService;

    public EmailService(JavaMailSender mailSender, EmailLogService emailLogService) {
        this.mailSender = mailSender;
        this.emailLogService = emailLogService;
    }

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.admin-email:admin@travelhub.com}")
    private String adminEmail;

    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = baseUrl + "/verify?token=" + token;
        String message = "<h3>Welcome to TravelHub!</h3>"
                + "<p>Please click the link below to verify your email address:</p>"
                + "<a href=\"" + verificationUrl + "\">Verify Email</a>";
        sendEmail(email, "Verify your email - TravelHub", message, "AUTH", null);
    }

    public void sendBookingConfirmation(Booking booking) {
        String message = "<h3>Booking Confirmation</h3>"
                + "<p>Dear Customer, your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been received.</p>"
                + "<p>Status: <b>PENDING</b></p>"
                + "<p>We will notify you once the agent approves it.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Received - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingApprovalNotification(Booking booking) {
        String paymentUrl = baseUrl + "/payment/" + booking.getId();
        String message = "<h3>Booking Approved!</h3>"
                + "<p>Your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been approved.</p>"
                + "<p>Start Date: " + booking.getStartDate() + "</p>"
                + "<p>Please complete your payment to confirm the trip.</p>"
                + "<p><a href=\"" + paymentUrl + "\">Pay Now</a></p>";
        sendEmail(booking.getUser().getEmail(), "Booking Approved - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingDeclineNotification(Booking booking, String reason) {
        String message = "<h3>Booking Declined</h3>"
                + "<p>Unfortunately, your booking for <b>" + booking.getPkg().getPackageName() + "</b> was declined.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>Please contact the agent or try another package.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Declined - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendPaymentConfirmation(Payment payment) {
        Booking booking = payment.getBooking();
        String billingUrl = baseUrl + "/billing";
        String message = "<h3>Payment Successful</h3>"
                + "<p>Thank you! Your payment of <b>LKR " + String.format("%,.2f", payment.getAmount()) + "</b> was received.</p>"
                + "<p>Booking: <b>" + booking.getPkg().getPackageName() + "</b></p>"
                + "<p>Transaction ID: " + payment.getTransactionId() + "</p>"
                + "<p>You can download your receipt from your <a href=\"" + billingUrl + "\">billing history</a>.</p>";
        sendEmail(payment.getUser().getEmail(), "Payment Confirmation - TravelHub", message, "PAYMENT", payment.getId());
    }

    public void sendAccountApprovalNotification(User user) {
        String message = "<h3>Account Approved</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>Congratulations! Your account as a <b>" + user.getRole() + "</b> has been approved by our administrators.</p>"
                + "<p>You can now log in and start using TravelHub.</p>";
        sendEmail(user.getEmail(), "Account Approved - TravelHub", message, "ACCOUNT", user.getId());
    }

    public void sendAccountRejectionNotification(User user, String reason) {
        String message = "<h3>Account Application Update</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>We regret to inform you that your account application as an <b>" + user.getRole() + "</b> has been rejected.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>If you have any questions, please contact our support team.</p>";
        sendEmail(user.getEmail(), "Account Application Update - TravelHub", message, "ACCOUNT", user.getId());
    }

    public void sendHotelStatusNotification(String recipientEmail, String hotelName, String status, String reason) {
        String subject = "Hotel " + status + " - TravelHub";
        String message = "<h3>Hotel " + status + "</h3>"
                + "<p>Your hotel <b>" + hotelName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now live on our platform.</p>" : "");
        sendEmail(recipientEmail, subject, message, "HOTEL", null);
    }

    public void sendPackageStatusNotification(String recipientEmail, String packageName, String status, String reason) {
        String subject = "Travel Package " + status + " - TravelHub";
        String message = "<h3>Travel Package " + status + "</h3>"
                + "<p>Your package <b>" + packageName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now available for tourists to book.</p>" : "");
        sendEmail(recipientEmail, subject, message, "PACKAGE", null);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        String message = "<h3>Password Reset Request</h3>"
                + "<p>Click the link below to reset your password:</p>"
                + "<a href=\"" + resetUrl + "\">Reset Password</a>";
        sendEmail(email, "Reset your password - TravelHub", message, "AUTH", null);
    }

    public void sendPendingApprovalNotification(User user) {
        String message = "<h3>Registration Received!</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>Thank you for registering as a <b>" + user.getRole() + "</b>. Your email has been verified successfully.</p>"
                + "<p>Status: <b>PENDING APPROVAL</b></p>"
                + "<p>Our administration team is currently reviewing your documents. We will notify you via email once your account is activated.</p>";
        sendEmail(user.getEmail(), "Account Pending Approval - TravelHub", message, "ACCOUNT", user.getId());
    }

    public void sendAdminReviewNotification(User user) {
        String message = "<h3>New Account Review Required</h3>"
                + "<p>A new <b>" + user.getRole() + "</b> account has been created and is waiting for your review.</p>"
                + "<p>Name: " + user.getName() + "</p>"
                + "<p>Email: " + user.getEmail() + "</p>"
                + "<p>Please log in to the admin dashboard to review and approve the application.</p>";
        sendEmail(adminEmail, "Review Required: New " + user.getRole() + " - TravelHub", message, "ACCOUNT", user.getId());
    }

    private void sendEmail(String to, String subject, String content, String relatedType, Long relatedId) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(content, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("no-reply@travelhub.com");
            mailSender.send(mimeMessage);
            emailLogService.logSent(to, subject, content, relatedType, relatedId);
        } catch (MessagingException e) {
            emailLogService.logFailed(to, subject, content, relatedType, relatedId, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
