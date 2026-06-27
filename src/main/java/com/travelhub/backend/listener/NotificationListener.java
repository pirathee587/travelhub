package com.travelhub.backend.listener;

import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailService;
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
    private final OwnerNotificationService ownerNotificationService;

    @Async
    @EventListener
    public void handleBookingEvent(BookingEvent event) {
        log.info("Handling booking event: {} for booking ID: {}", event.getType(), event.getBooking().getId());

        switch (event.getType()) {
            case "CREATED":
                emailService.sendBookingConfirmation(event.getBooking());
                break;
            case "APPROVED":
                emailService.sendBookingApprovalNotification(event.getBooking());
                break;
            case "DECLINED":
                emailService.sendBookingDeclineNotification(event.getBooking(), event.getReason());
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

        if (event.getPkg().getAgent() != null && event.getPkg().getAgent().getOwner() != null) {
            emailService.sendPackageStatusNotification(event.getPkg().getAgent().getOwner().getEmail(), event.getPkg().getPackageName(), event.getType(), event.getReason());
        }
    }
}