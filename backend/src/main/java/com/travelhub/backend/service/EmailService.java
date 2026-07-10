package com.travelhub.backend.service;

import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogService emailLogService;
    private final UserRepository userRepository;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = "http://localhost:5173/verify?token=" + token;
        String message = "<h3>Welcome to TravelHub!</h3>"
                + "<p>Please click the link below to verify your email address:</p>"
                + "<a href=\"" + verificationUrl + "\">Verify Email</a>";

        User user = userRepository.findByEmail(email).orElse(null);
        Long userId = user != null ? user.getId() : null;
        sendEmail(email, "Verify your email - TravelHub", message, "USER", userId);
    }

    public void sendBookingConfirmation(Booking booking) {
        String message = "<h3>Booking Confirmation</h3>"
                + "<p>Dear Customer, your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been received.</p>"
                + "<p>Status: <b>PENDING</b></p>"
                + "<p>We will notify you once the agent approves it.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Received - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendAgentBookingNotification(Booking booking) {
        if (booking.getPkg() == null || booking.getPkg().getAgent() == null || booking.getPkg().getAgent().getOwner() == null) {
            return;
        }
        
        String agentEmail = booking.getPkg().getAgent().getOwner().getEmail();
        String approveUrl = backendUrl + "/api/v1/agent/bookings/" + booking.getId() + "/email-accept";
        String declineUrl = backendUrl + "/api/v1/agent/bookings/" + booking.getId() + "/email-decline";
        
        String message = "<h3>New Booking Request</h3>"
                + "<p>Dear Agent, you have received a new booking request for <b>" + booking.getPkg().getPackageName() + "</b>.</p>"
                + "<p>Tourist: <b>" + booking.getUser().getName() + "</b></p>"
                + "<p>Dates: <b>" + booking.getStartDate() + " to " + booking.getEndDate() + "</b></p>"
                + "<p>Total Price: <b>$" + booking.getTotalPrice() + "</b></p>"
                + "<p>Please click below to action this booking:</p>"
                + "<p>"
                + "<a href=\"" + approveUrl + "\" style=\"background-color:#10b981;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;margin-right:10px;display:inline-block;\">Approve Booking</a>"
                + "<a href=\"" + declineUrl + "\" style=\"background-color:#ef4444;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;display:inline-block;\">Decline Booking</a>"
                + "</p>"
                + "<p>Or log into your dashboard to review details.</p>";
                
        sendEmail(agentEmail, "New Booking Request - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingApprovalNotification(Booking booking) {
        String message = "<h3>Booking Approved!</h3>"
                + "<p>Your booking for <b>" + booking.getPkg().getPackageName() + "</b> has been approved.</p>"
                + "<p>Start Date: " + booking.getStartDate() + "</p>"
                + "<p>You can now view the details in your dashboard.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Approved - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingDeclineNotification(Booking booking, String reason) {
        String message = "<h3>Booking Declined</h3>"
                + "<p>Unfortunately, your booking for <b>" + booking.getPkg().getPackageName() + "</b> was declined.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>Please contact the agent or try another package.</p>";
        sendEmail(booking.getUser().getEmail(), "Booking Declined - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendAccountApprovalNotification(User user) {
        String message = "<h3>Account Approved</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>Congratulations! Your account as a <b>" + user.getRole() + "</b> has been approved by our administrators.</p>"
                + "<p>You can now log in and start using TravelHub.</p>";
        sendEmail(user.getEmail(), "Account Approved - TravelHub", message, "USER", user.getId());
    }

    public void sendAccountRejectionNotification(User user, String reason) {
        String message = "<h3>Account Application Update</h3>"
                + "<p>Dear " + user.getName() + ",</p>"
                + "<p>We regret to inform you that your account application as an <b>" + user.getRole() + "</b> has been rejected.</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + "<p>If you have any questions, please contact our support team.</p>";
        sendEmail(user.getEmail(), "Account Application Update - TravelHub", message, "USER", user.getId());
    }

    public void sendHotelStatusNotification(String recipientEmail, String hotelName, String status, String reason) {
        String subject = "Hotel " + status + " - TravelHub";
        String message = "<h3>Hotel " + status + "</h3>"
                + "<p>Your hotel <b>" + hotelName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now live on our platform.</p>" : "");
        
        User user = userRepository.findByEmail(recipientEmail).orElse(null);
        Long userId = user != null ? user.getId() : null;
        sendEmail(recipientEmail, subject, message, "USER", userId);
    }

    public void sendPackageStatusNotification(String recipientEmail, String packageName, String status, String reason) {
        String subject = "Travel Package " + status + " - TravelHub";
        String message = "<h3>Travel Package " + status + "</h3>"
                + "<p>Your package <b>" + packageName + "</b> has been " + status.toLowerCase() + ".</p>"
                + (reason != null ? "<p>Reason: " + reason + "</p>" : "")
                + (status.equals("APPROVED") ? "<p>It is now available for tourists to book.</p>" : "");

        User user = userRepository.findByEmail(recipientEmail).orElse(null);
        Long userId = user != null ? user.getId() : null;
        sendEmail(recipientEmail, subject, message, "USER", userId);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        String message = "<h3>Password Reset Request</h3>"
                + "<p>Click the link below to reset your password:</p>"
                + "<a href=\"" + resetUrl + "\">Reset Password</a>";

        User user = userRepository.findByEmail(email).orElse(null);
        Long userId = user != null ? user.getId() : null;
        sendEmail(email, "Reset your password - TravelHub", message, "USER", userId);
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
        } catch (Exception e) {
            emailLogService.logFailed(to, subject, content, relatedType, relatedId, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
