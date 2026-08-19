package com.travelhub.backend.service;

import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.PayoutRequest;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.RefundRequest;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailTemplateBuilder.EmailButton;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogService emailLogService;
    private final UserRepository userRepository;
    private final EmailTemplateBuilder templates;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public void sendVerificationEmail(String email, String token) {
        String verificationUrl = baseUrl + "/verify?token=" + token;
        User user = userRepository.findByEmail(email).orElse(null);
        String message = templates.render(templates.content("Verify your email address")
                .recipientName(user != null ? user.getName() : null)
                .intro("Welcome to TravelHub. Please verify your email to activate your account and start exploring Sri Lanka.")
                .button(EmailButton.primary("Verify Email Address", verificationUrl))
                .footerNote("This link expires in 24 hours. If it expires, you can request a new verification email from the login page. "
                        + "If you did not create a TravelHub account, you can safely ignore this email.")
                .build());

        Long userId = user != null ? user.getId() : null;
        sendEmail(email, "Verify your email - TravelHub", message, "USER", userId);
    }

    public void sendBookingConfirmation(Booking booking) {
        String details = templates.detailRow("Package", booking.getPkg().getPackageName())
                + templates.detailRow("Dates", booking.getStartDate() + " to " + booking.getEndDate())
                + templates.detailRow("Total", formatMoney(booking.getTotalPrice()))
                + templates.detailRow("Status", "Pending agent approval");

        String message = templates.render(templates.content("Booking received")
                .recipientName(booking.getUser().getName())
                .intro("We have received your booking request. Here are your trip details:")
                .detailsHtml(details)
                .bodyHtml("We will email you as soon as the travel agency confirms your booking.")
                .button(EmailButton.primary("View My Trips", dashboardUrl(Role.TOURIST)))
                .build());

        sendEmail(booking.getUser().getEmail(), "Booking Received - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendAgentBookingNotification(Booking booking) {
        if (booking.getPkg() == null || booking.getPkg().getAgent() == null || booking.getPkg().getAgent().getOwner() == null) {
            return;
        }

        Agent agent = booking.getPkg().getAgent();
        String agentEmail = agent.getOwner().getEmail();
        String reviewUrl = trimTrailingSlash(baseUrl) + "/agency/bookings/" + booking.getId();
        String declineUrl = backendUrl + "/api/v1/agent/bookings/" + booking.getId() + "/email-decline";

        String details = templates.detailRow("Package", booking.getPkg().getPackageName())
                + templates.detailRow("Tourist", booking.getUser().getName())
                + templates.detailRow("Dates", booking.getStartDate() + " to " + booking.getEndDate())
                + templates.detailRow("Amount", formatMoney(booking.getTotalPrice()));

        String message = templates.render(templates.content("New booking request")
                .recipientName(agent.getAgencyName())
                .intro("You have received a new booking request that requires your review.")
                .detailsHtml(details)
                .bodyHtml("Assign a vehicle and driver in your dashboard before accepting the booking.")
                .button(EmailButton.primary("Review & Accept in Dashboard", reviewUrl))
                .button(EmailButton.danger("Decline Booking", declineUrl))
                .footerNote("Quick decline works from this email. Acceptance must be completed in your agency dashboard.")
                .build());

        sendEmail(agentEmail, "New Booking Request - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingApprovalNotification(Booking booking) {
        String details = templates.detailRow("Package", booking.getPkg().getPackageName())
                + templates.detailRow("Start date", String.valueOf(booking.getStartDate()));

        String message = templates.render(templates.content("Your booking has been approved")
                .recipientName(booking.getUser().getName())
                .intro("Great news — your booking has been approved by the travel agency.")
                .detailsHtml(details)
                .bodyHtml("You can view your itinerary and next steps in your dashboard.")
                .button(EmailButton.primary("View Booking Details", dashboardUrl(Role.TOURIST)))
                .build());

        sendEmail(booking.getUser().getEmail(), "Booking Approved - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendBookingDeclineNotification(Booking booking, String reason) {
        String details = templates.detailRow("Package", booking.getPkg().getPackageName())
                + (reason != null ? templates.detailRow("Reason", reason) : "");

        String message = templates.render(templates.content("Update on your booking request")
                .recipientName(booking.getUser().getName())
                .intro("Unfortunately, your booking request was declined by the travel agency.")
                .detailsHtml(details)
                .bodyHtml("You may browse other packages or contact the agency for alternative options.")
                .button(EmailButton.primary("Explore Packages", trimTrailingSlash(baseUrl) + "/"))
                .build());

        sendEmail(booking.getUser().getEmail(), "Booking Declined - TravelHub", message, "BOOKING", booking.getId());
    }

    public void sendAccountApprovalNotification(User user) {
        String message = templates.render(templates.content("Your TravelHub account has been approved")
                .recipientName(user.getName())
                .intro("Good news — your TravelHub <strong>" + templates.escape(formatRole(user.getRole()))
                        + "</strong> account has been reviewed and approved by our admin team.")
                .bodyHtml("You can now sign in and access your dashboard.")
                .button(EmailButton.primary("Go to Dashboard", dashboardUrl(user.getRole())))
                .footerNote("Welcome aboard, and thank you for partnering with TravelHub.")
                .build());

        sendEmail(user.getEmail(), "Account Approved - TravelHub", message, "USER", user.getId());
    }

    public void sendAccountRejectionNotification(User user, String reason) {
        var builder = templates.content("Update on your TravelHub application")
                .recipientName(user.getName())
                .intro("Thank you for applying to join TravelHub as a <strong>" + templates.escape(formatRole(user.getRole()))
                        + "</strong>. After review, we are unable to approve your application at this time.");

        if (reason != null && !reason.isBlank()) {
            builder.detailsHtml(templates.detailRow("Reason", reason));
        }

        String message = templates.render(builder
                .bodyHtml("You may update your information and reapply, or contact support if you believe this was a mistake.")
                .button(EmailButton.primary("Contact Support", "mailto:hello@travelhub.lk"))
                .build());

        sendEmail(user.getEmail(), "Account Application Update - TravelHub", message, "USER", user.getId());
    }

    public void sendHotelStatusNotification(String recipientEmail, String hotelName, String status, String reason) {
        String normalizedStatus = status != null ? status.toUpperCase() : "UPDATED";
        String subject = "Hotel listing update - TravelHub";
        String headline = "Hotel listing " + normalizedStatus.toLowerCase();

        StringBuilder details = new StringBuilder();
        details.append(templates.detailRow("Hotel", hotelName));
        details.append(templates.detailRow("Status", formatStatus(normalizedStatus)));
        if (reason != null && !reason.isBlank()) {
            details.append(templates.detailRow("Reason", reason));
        }

        User user = userRepository.findByEmail(recipientEmail).orElse(null);
        String intro = switch (normalizedStatus) {
            case "APPROVED" -> "Your hotel listing has been approved and is now live on TravelHub.";
            case "REJECTED" -> "Your hotel listing requires changes before it can be published.";
            case "SUSPENDED" -> "Your hotel listing has been suspended on TravelHub.";
            default -> "There is an update regarding your hotel listing on TravelHub.";
        };

        String message = templates.render(templates.content(headline)
                .recipientName(user != null ? user.getName() : null)
                .intro(intro)
                .detailsHtml(details.toString())
                .bodyHtml("APPROVED".equals(normalizedStatus)
                        ? "Tourists can now view your property, rooms, and amenities on the platform."
                        : "Please review the details and contact support if you need assistance.")
                .button(EmailButton.primary("Manage Hotel Listing", dashboardUrl(Role.HOTEL_OWNER)))
                .build());

        Long userId = user != null ? user.getId() : null;
        sendEmail(recipientEmail, subject, message, "USER", userId);
    }

    public void sendPackageStatusNotification(String recipientEmail, String packageName, String status, String reason) {
        String normalizedStatus = status != null ? status.toUpperCase() : "UPDATED";
        String subject = "Travel package update - TravelHub";
        String headline = "Travel package " + normalizedStatus.toLowerCase();

        StringBuilder details = new StringBuilder();
        details.append(templates.detailRow("Package", packageName));
        details.append(templates.detailRow("Status", formatStatus(normalizedStatus)));
        if (reason != null && !reason.isBlank()) {
            details.append(templates.detailRow("Reason", reason));
        }

        User user = userRepository.findByEmail(recipientEmail).orElse(null);
        String intro = "APPROVED".equals(normalizedStatus)
                ? "Your travel package has been approved and is now available for tourists to book."
                : "There is an update regarding your travel package on TravelHub.";

        String message = templates.render(templates.content(headline)
                .recipientName(user != null ? user.getName() : null)
                .intro(intro)
                .detailsHtml(details.toString())
                .button(EmailButton.primary("Manage Packages", dashboardUrl(Role.AGENT)))
                .build());

        Long userId = user != null ? user.getId() : null;
        sendEmail(recipientEmail, subject, message, "USER", userId);
    }

    public void sendPasswordResetEmail(String email, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        User user = userRepository.findByEmail(email).orElse(null);

        String message = templates.render(templates.content("Reset your password")
                .recipientName(user != null ? user.getName() : null)
                .intro("We received a request to reset the password for your TravelHub account.")
                .button(EmailButton.primary("Reset Password", resetUrl))
                .footerNote("This link expires in 1 hour. If you did not request a password reset, please ignore this email — your password will remain unchanged.")
                .closingTeam("TravelHub Security Team")
                .build());

        Long userId = user != null ? user.getId() : null;
        sendEmail(email, "Reset your password - TravelHub", message, "USER", userId);
    }

    public void sendPasswordChangedNotification(User user) {
        if (user == null || user.getEmail() == null) {
            return;
        }

        String message = templates.render(templates.content("Security alert: password changed")
                .recipientName(user.getName())
                .intro("Your TravelHub account password was successfully updated.")
                .bodyHtml("If you performed this action, no further action is required.")
                .alertHtml("If you did <strong>not</strong> change your password, please contact our support team immediately or request a password reset.")
                .button(EmailButton.primary("Reset Password", trimTrailingSlash(baseUrl) + "/forgot-password"))
                .closingTeam("TravelHub Security Team")
                .build());

        sendEmail(user.getEmail(), "Security Alert: Password Changed - TravelHub", message, "USER", user.getId());
    }

    public void sendPaymentConfirmation(Payment payment) {
        if (payment.getUser() == null) {
            return;
        }

        String packageName = payment.getBooking() != null && payment.getBooking().getPkg() != null
                ? payment.getBooking().getPkg().getPackageName()
                : "Travel Booking";

        String details = templates.detailRow("Package", packageName)
                + templates.detailRow("Amount paid", formatMoney(payment.getAmount()))
                + templates.detailRow("Transaction ID", payment.getTransactionId())
                + templates.detailRow("Status", "Successful");

        String message = templates.render(templates.content("Payment confirmed")
                .recipientName(payment.getUser().getName())
                .intro("Your payment has been successfully received.")
                .detailsHtml(details)
                .bodyHtml("A receipt is available in your billing history.")
                .button(EmailButton.primary("View Billing History", trimTrailingSlash(baseUrl) + "/tourist/billing"))
                .build());

        sendEmail(payment.getUser().getEmail(), "Payment Confirmation - TravelHub", message, "PAYMENT", payment.getId());
    }

    public void sendAgentRefundAlert(RefundRequest request) {
        if (request.getAgent() == null || request.getAgent().getOwner() == null) {
            return;
        }

        String agentEmail = request.getAgent().getOwner().getEmail();
        String details = templates.detailRow("Booking ID", "BK-" + request.getBooking().getId())
                + templates.detailRow("Amount", formatMoney(request.getBooking().getTotalPrice()))
                + templates.detailRow("Reason", request.getReason())
                + templates.detailRow("Bank name", request.getBankName())
                + templates.detailRow("Account number", request.getAccountNo())
                + templates.detailRow("Account holder", request.getAccountHolderName())
                + templates.detailRow("Branch", request.getBranchName());

        String message = templates.render(templates.content("Refund request received")
                .recipientName(request.getAgent().getAgencyName())
                .intro("A tourist has submitted a refund request for the booking below.")
                .detailsHtml(details)
                .bodyHtml("Please review the request in your dashboard and process the transfer manually via your bank. "
                        + "Upload the deposit receipt in your dashboard once completed.")
                .button(EmailButton.primary("Review Refund Request", dashboardUrl(Role.AGENT)))
                .build());

        sendEmail(agentEmail, "Refund Request Alert - TravelHub", message, "BOOKING", request.getBooking().getId());
    }

    public void sendTouristRefundApproved(RefundRequest request) {
        String details = templates.detailRow("Booking ID", "BK-" + request.getBooking().getId())
                + templates.detailRow("Refund amount", formatMoney(request.getBooking().getTotalPrice()));

        var builder = templates.content("Your refund has been approved")
                .recipientName(request.getUser().getName())
                .intro("Your refund request has been approved by the travel agency.")
                .detailsHtml(details)
                .bodyHtml("The travel agency has completed the bank transfer.");

        if (request.getRefundSlipUrl() != null && !request.getRefundSlipUrl().isBlank()) {
            builder.button(EmailButton.primary("View Refund Receipt", request.getRefundSlipUrl()));
        }

        sendEmail(request.getUser().getEmail(), "Refund Request Approved - TravelHub", templates.render(builder.build()), "BOOKING", request.getBooking().getId());
    }

    public void sendTouristRefundDeclined(RefundRequest request, String reason) {
        String details = templates.detailRow("Booking ID", "BK-" + request.getBooking().getId())
                + templates.detailRow("Reason provided", reason);

        String message = templates.render(templates.content("Update on your refund request")
                .recipientName(request.getUser().getName())
                .intro("Your refund request was declined by the travel agency.")
                .detailsHtml(details)
                .bodyHtml("If you have questions, please contact support or review the cancellation policy in your booking details.")
                .button(EmailButton.primary("View Booking", dashboardUrl(Role.TOURIST)))
                .build());

        sendEmail(request.getUser().getEmail(), "Refund Request Declined - TravelHub", message, "BOOKING", request.getBooking().getId());
    }

    public void sendPayoutRequestConfirmation(Agent agent, PayoutRequest request) {
        if (agent == null || agent.getOwner() == null || agent.getOwner().getEmail() == null) {
            return;
        }

        String details = templates.detailRow("Amount", formatMoney(request.getAmount()))
                + templates.detailRow("Bank", request.getBankName() + " (" + request.getAccountNo() + ")")
                + templates.detailRow("Status", "Pending admin verification");

        String message = templates.render(templates.content("Payout request submitted")
                .recipientName(agent.getAgencyName())
                .intro("Your payout request has been submitted successfully and is pending admin verification.")
                .detailsHtml(details)
                .bodyHtml("We will notify you once your payout has been processed.")
                .button(EmailButton.primary("View Wallet", dashboardUrl(Role.AGENT)))
                .build());

        sendEmail(agent.getOwner().getEmail(), "Payout Request Submitted - TravelHub", message, "PAYOUT", request.getId());
    }

    public void sendPayoutApprovedNotification(Agent agent, PayoutRequest request) {
        if (agent == null || agent.getOwner() == null || agent.getOwner().getEmail() == null) {
            return;
        }

        String details = templates.detailRow("Amount", formatMoney(request.getAmount()))
                + templates.detailRow("Bank", request.getBankName() + " (" + request.getAccountNo() + ")");

        var builder = templates.content("Payout approved and processed")
                .recipientName(agent.getAgencyName())
                .intro("Your payout has been approved and processed.")
                .detailsHtml(details);

        if (request.getTransferSlipUrl() != null && !request.getTransferSlipUrl().isBlank()) {
            builder.button(EmailButton.primary("View Transfer Receipt", request.getTransferSlipUrl()));
        }

        sendEmail(agent.getOwner().getEmail(), "Payout Approved & Processed - TravelHub", templates.render(builder.build()), "PAYOUT", request.getId());
    }

    public void sendPayoutRejectedNotification(Agent agent, PayoutRequest request, String reason) {
        if (agent == null || agent.getOwner() == null || agent.getOwner().getEmail() == null) {
            return;
        }

        String details = templates.detailRow("Amount", formatMoney(request.getAmount()))
                + templates.detailRow("Reason", reason != null ? reason : "Unspecified");

        String message = templates.render(templates.content("Payout request declined")
                .recipientName(agent.getAgencyName())
                .intro("Your payout request was declined.")
                .detailsHtml(details)
                .bodyHtml("The requested amount has been returned to your available wallet balance. "
                        + "You may update your bank details and submit a new request.")
                .button(EmailButton.primary("Go to Wallet", dashboardUrl(Role.AGENT)))
                .build());

        sendEmail(agent.getOwner().getEmail(), "Payout Request Declined - TravelHub", message, "PAYOUT", request.getId());
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

    private String dashboardUrl(Role role) {
        if (role == null) {
            return trimTrailingSlash(baseUrl) + "/login";
        }
        return switch (role) {
            case TOURIST -> trimTrailingSlash(baseUrl) + "/tourist/overview";
            case AGENT -> trimTrailingSlash(baseUrl) + "/agency";
            case HOTEL_OWNER -> trimTrailingSlash(baseUrl) + "/hotelowner";
            case ADMIN -> trimTrailingSlash(baseUrl) + "/admin";
        };
    }

    private String formatRole(Role role) {
        if (role == null) {
            return "account";
        }
        return switch (role) {
            case TOURIST -> "Tourist";
            case AGENT -> "Travel Agency";
            case HOTEL_OWNER -> "Hotel Owner";
            case ADMIN -> "Admin";
        };
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Updated";
        }
        return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
    }

    private String formatMoney(Number amount) {
        if (amount == null) {
            return "$0.00";
        }
        return String.format("$%.2f", amount.doubleValue());
    }

    private String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:5173";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
