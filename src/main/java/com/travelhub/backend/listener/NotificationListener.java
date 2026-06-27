package com.travelhub.backend.listener;

import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Payment;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.PaymentEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailService;
import com.travelhub.backend.service.UserNotificationService;
import com.travelhub.backend.service.OwnerNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationListener {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final UserNotificationService userNotificationService;
    private final OwnerNotificationService ownerNotificationService;

    @Async
    @EventListener
    public void handleBookingEvent(BookingEvent event) {
        log.info("Handling booking event: {} for booking ID: {}", event.getType(), event.getBooking().getId());
        Booking booking = event.getBooking();

        switch (event.getType()) {
            case "CREATED":
                emailService.sendBookingConfirmation(booking);
                if (booking.getPkg() != null && booking.getPkg().getAgent() != null) {
                    userNotificationService.notifyAgent(
                        booking.getPkg().getAgent(),
                        "booking",
                        "New Package Booking",
                        "You have received a new booking request for package: " + booking.getPkg().getPackageName()
                    );
                }
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "booking",
                        "Booking Pending",
                        "Your booking request for " + booking.getPkg().getPackageName() + " is pending agent confirmation.",
                        "/tourist/bookings"
                    );
                }
                break;
            case "APPROVED":
                emailService.sendBookingApprovalNotification(booking);
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "booking",
                        "Booking Confirmed",
                        "Your booking " + String.format("BK%05d", booking.getId()) + " for " + booking.getPkg().getPackageName() + " has been confirmed by the agent.",
                        "/tourist/bookings"
                    );
                }
                break;
            case "DECLINED":
                emailService.sendBookingDeclineNotification(booking, event.getReason());
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "booking",
                        "Booking Declined",
                        "Your booking " + String.format("BK%05d", booking.getId()) + " has been declined. Reason: " + event.getReason(),
                        "/tourist/bookings"
                    );
                }
                break;
            case "CANCELLED":
                if (booking.getPkg() != null && booking.getPkg().getAgent() != null) {
                    userNotificationService.notifyAgent(
                        booking.getPkg().getAgent(),
                        "booking",
                        "Booking Cancelled",
                        "Booking " + String.format("BK%05d", booking.getId()) + " has been cancelled."
                    );
                }
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(
                        booking.getUser().getId(),
                        "booking",
                        "Booking Cancelled",
                        "Your booking " + String.format("BK%05d", booking.getId()) + " has been cancelled.",
                        "/tourist/bookings"
                    );
                }
                break;
        }
    }

    @Async
    @EventListener
    public void handleUserAccountEvent(UserAccountEvent event) {
        log.info("Handling user account event: {} for user: {}", event.getType(), event.getUser().getEmail());

        switch (event.getType()) {
            case "APPROVED":
                emailService.sendAccountApprovalNotification(event.getUser());
                break;
            case "REJECTED":
                emailService.sendAccountRejectionNotification(event.getUser(), event.getReason());
                break;
            case "REGISTERED":
                emailService.sendVerificationEmail(event.getUser().getEmail(), event.getToken());
                break;
            case "PASSWORD_RESET":
                emailService.sendPasswordResetEmail(event.getUser().getEmail(), event.getToken());
                break;
        }
    }

    @Async
    @EventListener
    public void handleHotelEvent(HotelEvent event) {
        log.info("Handling hotel event: {} for hotel: {}", event.getType(), event.getHotel().getHotelName());

        userRepository.findByHotelId(event.getHotel().getId()).ifPresent(user -> {
            // Send email for APPROVED and REJECTED only (not SUSPENDED)
            if (!"SUSPENDED".equals(event.getType())) {
                emailService.sendHotelStatusNotification(
                        user.getEmail(),
                        event.getHotel().getHotelName(),
                        event.getType(),
                        event.getReason());
            }

            // Persist an in-app notification for hotel owner for APPROVED, REJECTED, SUSPENDED
            String type = event.getType();
            if ("APPROVED".equals(type) || "REJECTED".equals(type) || "SUSPENDED".equals(type)) {
                String hotelName = event.getHotel().getHotelName();
                String title = buildTitle(type, hotelName);
                String message = buildMessage(type, hotelName, event.getReason());
                ownerNotificationService.save(
                        user.getId(),
                        event.getHotel().getId(),
                        type,
                        title,
                        message);
            }
        });
    }

    private String buildTitle(String type, String hotelName) {
        return switch (type) {
            case "APPROVED"  -> "Hotel Approved: " + hotelName;
            case "REJECTED"  -> "Hotel Rejected: " + hotelName;
            case "SUSPENDED" -> "Hotel Suspended: " + hotelName;
            default          -> hotelName + " — Status Updated";
        };
    }

    private String buildMessage(String type, String hotelName, String reason) {
        return switch (type) {
            case "APPROVED"  -> "Your hotel \"" + hotelName + "\" has been approved and is now live on TravelHUB.";
            case "REJECTED"  -> "Your hotel \"" + hotelName + "\" was rejected."
                    + (reason != null ? " Reason: " + reason : "");
            case "SUSPENDED" -> "Your hotel \"" + hotelName + "\" has been suspended by an administrator."
                    + (reason != null ? " Reason: " + reason : "");
            default          -> "The status of \"" + hotelName + "\" has been updated to " + type + ".";
        };
    }

    @Async
    @EventListener
    public void handlePackageEvent(PackageEvent event) {
        log.info("Handling package event: {} for package: {}", event.getType(), event.getPkg().getPackageName());

        if (event.getPkg().getAgent() != null) {
            String agentEmail = event.getPkg().getAgent().getOwner() != null
                    ? event.getPkg().getAgent().getOwner().getEmail()
                    : null;
            if (agentEmail != null) {
                emailService.sendPackageStatusNotification(agentEmail, event.getPkg().getPackageName(), event.getType(), event.getReason());
            } else {
                System.err.println("Skipping package status email — agent has no email (agentId: " + event.getPkg().getAgent().getId() + ")");
            }

            if ("APPROVED".equals(event.getType())) {
                userNotificationService.notifyAgent(
                    event.getPkg().getAgent(),
                    "package",
                    "Package Approved",
                    "Your package '" + event.getPkg().getPackageName() + "' has been approved by admin."
                );
            } else if ("REJECTED".equals(event.getType())) {
                userNotificationService.notifyAgent(
                    event.getPkg().getAgent(),
                    "package",
                    "Package Rejected",
                    "Your package '" + event.getPkg().getPackageName() + "' was rejected by admin. Reason: " + event.getReason()
                );
            }
        }
    }

    @Async
    @EventListener
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Handling payment event: {} for payment ID: {}", event.getType(), event.getPayment().getId());
        Payment payment = event.getPayment();
        Booking booking = payment.getBooking();
        Agent agent = (booking != null && booking.getPkg() != null) ? booking.getPkg().getAgent() : payment.getAgent();
        User tourist = payment.getUser();

        if ("COMPLETED".equals(event.getType())) {
            if (agent != null) {
                userNotificationService.notifyAgent(
                    agent,
                    "payment",
                    "Payment Received",
                    "Payment of $" + payment.getAmount() + " received for booking " + (booking != null ? String.format("BK%05d", booking.getId()) : "")
                );
            }
            if (tourist != null) {
                userNotificationService.notifyUser(
                    tourist.getId(),
                    "payment",
                    "Payment Successful",
                    "Your payment of $" + payment.getAmount() + " for booking " + (booking != null ? String.format("BK%05d", booking.getId()) : "") + " was successful.",
                    "/tourist/bookings"
                );
            }
        } else if ("FAILED".equals(event.getType())) {
            if (agent != null) {
                userNotificationService.notifyAgent(
                    agent,
                    "payment",
                    "Payment Failed",
                    "Payment of $" + payment.getAmount() + " failed for booking " + (booking != null ? String.format("BK%05d", booking.getId()) : "")
                );
            }
            if (tourist != null) {
                userNotificationService.notifyUser(
                    tourist.getId(),
                    "payment",
                    "Payment Failed",
                    "Your payment of $" + payment.getAmount() + " for booking " + (booking != null ? String.format("BK%05d", booking.getId()) : "") + " has failed.",
                    "/tourist/bookings"
                );
            }
        }
    }
}