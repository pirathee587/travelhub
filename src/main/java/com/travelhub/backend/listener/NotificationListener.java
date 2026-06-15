package com.travelhub.backend.listener;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.PaymentEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.service.EmailService;
import com.travelhub.backend.service.UserNotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationListener.class);
    private final EmailService emailService;
    private final UserNotificationService userNotificationService;

    public NotificationListener(EmailService emailService,
                                UserNotificationService userNotificationService) {
        this.emailService = emailService;
        this.userNotificationService = userNotificationService;
    }

    @Async
    @EventListener
    public void handleBookingEvent(BookingEvent event) {
        log.info("Handling booking event: {} for booking ID: {}", event.getType(), event.getBooking().getId());
        Booking booking = event.getBooking();

        switch (event.getType()) {
            case "CREATED":
                emailService.sendBookingConfirmation(booking);
                userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "BOOKING",
                        "Booking Received",
                        "Your booking for " + booking.getPkg().getPackageName() + " is pending agent approval.",
                        null
                );
                if (booking.getVehicle() != null && booking.getVehicle().getAgent() != null) {
                    userNotificationService.notifyAgent(
                            booking.getVehicle().getAgent(),
                            "BOOKING",
                            "New Booking Request",
                            booking.getUser().getName() + " requested " + booking.getPkg().getPackageName()
                    );
                }
                break;
            case "APPROVED":
                emailService.sendBookingApprovalNotification(booking);
                userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "BOOKING",
                        "Booking Approved",
                        "Your booking was approved. Complete payment to confirm your trip.",
                        "/payment/" + booking.getId()
                );
                break;
            case "DECLINED":
                emailService.sendBookingDeclineNotification(booking, event.getReason());
                userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "BOOKING",
                        "Booking Declined",
                        "Your booking for " + booking.getPkg().getPackageName() + " was declined.",
                        null
                );
                break;
            default:
                break;
        }
    }

    @Async
    @EventListener
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Handling payment event: {} for payment ID: {}", event.getType(), event.getPayment().getId());
        Payment payment = event.getPayment();
        Booking booking = payment.getBooking();

        if ("COMPLETED".equals(event.getType())) {
            emailService.sendPaymentConfirmation(payment);
            userNotificationService.notifyUser(
                    payment.getUser().getId(),
                    "PAYMENT",
                    "Payment Successful",
                    "Your payment for " + booking.getPkg().getPackageName() + " was completed successfully.",
                    "/billing"
            );
            if (payment.getAgent() != null) {
                userNotificationService.notifyAgent(
                        payment.getAgent(),
                        "PAYMENT",
                        "Payment Received",
                        booking.getUser().getName() + " paid LKR " + String.format("%,.2f", payment.getAmount())
                                + " for " + booking.getPkg().getPackageName()
                );
            }
        } else if ("FAILED".equals(event.getType())) {
            userNotificationService.notifyUser(
                    payment.getUser().getId(),
                    "PAYMENT",
                    "Payment Failed",
                    "Your payment attempt failed. Please try again from your billing page.",
                    "/payment/" + booking.getId()
            );
        }
    }

    @Async
    @EventListener
    public void handleUserAccountEvent(UserAccountEvent event) {
        log.info("Handling user account event: {} for user: {}", event.getType(), event.getUser().getEmail());

        switch (event.getType()) {
            case "APPROVED":
                emailService.sendAccountApprovalNotification(event.getUser());
                userNotificationService.notifyUser(
                        event.getUser().getId(),
                        "ACCOUNT",
                        "Account Approved",
                        "Your account has been approved. You can now use TravelHub.",
                        "/dashboard"
                );
                break;
            case "REJECTED":
                emailService.sendAccountRejectionNotification(event.getUser(), event.getReason());
                userNotificationService.notifyUser(
                        event.getUser().getId(),
                        "ACCOUNT",
                        "Account Rejected",
                        "Your account application was rejected.",
                        null
                );
                break;
            case "REGISTERED":
                emailService.sendVerificationEmail(event.getUser().getEmail(), event.getToken());
                break;
            case "PASSWORD_RESET":
                emailService.sendPasswordResetEmail(event.getUser().getEmail(), event.getToken());
                break;
            case "VERIFIED":
                if (event.getUser().getRole() == com.travelhub.backend.enums.Role.AGENT ||
                    event.getUser().getRole() == com.travelhub.backend.enums.Role.HOTEL_OWNER) {
                    emailService.sendPendingApprovalNotification(event.getUser());
                    emailService.sendAdminReviewNotification(event.getUser());
                    userNotificationService.notifyUser(
                            event.getUser().getId(),
                            "ACCOUNT",
                            "Pending Admin Approval",
                            "Your email is verified. An administrator is reviewing your application.",
                            null
                    );
                } else {
                    userNotificationService.notifyUser(
                            event.getUser().getId(),
                            "ACCOUNT",
                            "Email Verified",
                            "Your email has been verified. You can now log in.",
                            "/login"
                    );
                }
                break;
            default:
                break;
        }
    }

    @Async
    @EventListener
    public void handleHotelEvent(HotelEvent event) {
        log.info("Handling hotel event: {} for hotel: {}", event.getType(), event.getHotel().getHotelName());

        if (event.getHotel().getOwner() != null) {
            emailService.sendHotelStatusNotification(
                    event.getHotel().getOwner().getEmail(),
                    event.getHotel().getHotelName(),
                    event.getType(),
                    event.getReason()
            );
        }
    }

    @Async
    @EventListener
    public void handlePackageEvent(PackageEvent event) {
        log.info("Handling package event: {} for package: {}", event.getType(), event.getPkg().getPackageName());

        if (event.getPkg().getAgent() != null) {
            emailService.sendPackageStatusNotification(
                    event.getPkg().getAgent().getUser().getEmail(),
                    event.getPkg().getPackageName(),
                    event.getType(),
                    event.getReason()
            );
        }
    }
}
