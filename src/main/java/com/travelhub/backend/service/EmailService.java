package com.travelhub.backend.service;

import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.User;

@Service

public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = "http://localhost:5173/verify?token=" + token;
        String message = "<h3>Welcome to TravelHub!</h3>"
                + "<p>Please click the link below to verify your email address:</p>"
                + "<a href=\"" + verificationUrl + "\">Verify Email</a>";

        sendEmail(email, "Verify your email - TravelHub", message);
    }
    public void sendBookingConfirmation(Booking booking) {
        String message = "<h3>Booking Confirmation</h3>"
                + "<p>Dear Customer, your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been received.</p>"
                + "<p>Status: <b>PENDING</b></p>"
                + "<p>We will notify you once the agent approves it.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Received - TravelHub", message);
    }

    public void sendBookingApprovalNotification(Booking booking) {
        String message = "<h3>Booking Approved!</h3>"
                + "<p>Your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been approved.</p>"
                + "<p>Start Date: " + booking.getStartDate() + "</p>"
                + "<p>You can now view the details in your dashboard.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Approved - TravelHub", message);
    }

    public void sendBookingDeclineNotification(Booking booking, String reason) {
        String message = "<h3>Booking Declined</h3>"
                + "<p>Unfortunately, your booking for <b>" + booking.getPkg().getPackageName() + "</b> was declined.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>Please contact the agent or try another package.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Declined - TravelHub", message);
    }

    public void sendAccountApprovalNotification(User user) {
        String message = "<h3>Account Approved</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>Congratulations! Your account as a <b>" + user.getRole() + "</b> has been approved by our administrators.</p>"
                + "<p>You can now log in and start using TravelHub.</p>";
        sendEmail(user.getEmail(), "Account Approved - TravelHub", message);
    }

    public void sendAccountRejectionNotification(User user, String reason) {
        String message = "<h3>Account Application Update</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>We regret to inform you that your account application as an <b>" + user.getRole() + "</b> has been rejected.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>If you have any questions, please contact our support team.</p>";
        sendEmail(user.getEmail(), "Account Application Update - TravelHub", message);
    }

    public void sendHotelStatusNotification(String recipientEmail, String hotelName, String status, String reason) {
        String subject = "Hotel " + status + " - TravelHub";
        String message = "<h3>Hotel " + status + "</h3>"
                + "<p>Your hotel <b>" + hotelName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now live on our platform.</p>" : "");
        sendEmail(recipientEmail, subject, message);
    }

    public void sendPackageStatusNotification(String recipientEmail, String packageName, String status, String reason) {
        String subject = "Travel Package " + status + " - TravelHub";
        String message = "<h3>Travel Package " + status + "</h3>"
                + "<p>Your package <b>" + packageName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now available for tourists to book.</p>" : "");
        sendEmail(recipientEmail, subject, message);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        String message = "<h3>Password Reset Request</h3>"
                + "<p>Click the link below to reset your password:</p>"
                + "<a href=\"" + resetUrl + "\">Reset Password</a>";

        sendEmail(email, "Reset your password - TravelHub", message);
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(content, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("no-reply@travelhub.com");
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
