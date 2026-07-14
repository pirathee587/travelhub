package com.travelhub.backend.listener;

import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailService;
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
    private final com.travelhub.backend.service.AgentNotificationService agentNotificationService;
    private final com.travelhub.backend.repository.AgentRepository agentRepository;

    @Async
    @EventListener
    public void handleBookingEvent(BookingEvent event) {
        log.info("Handling booking event: {} for booking ID: {}", event.getType(), event.getBooking().getId());

        switch (event.getType()) {
            case "CREATED":
                emailService.sendBookingConfirmation(event.getBooking());
                if (event.getBooking().getPkg() != null && event.getBooking().getPkg().getAgent() != null) {
                    agentNotificationService.createNotification(event.getBooking().getPkg().getAgent(), "booking", "New Booking Request", "You have a new booking request for package " + event.getBooking().getPkg().getPackageName() + ".");
                }
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
                if (com.travelhub.backend.enums.Role.AGENT.equals(event.getUser().getRole())) {
                    agentRepository.findByOwnerId(event.getUser().getId()).ifPresent(agent -> {
                        agentNotificationService.createNotification(agent, "account", "Account Verified", "Your account has been verified successfully.");
                    });
                }
                break;
            case "REJECTED":
                emailService.sendAccountRejectionNotification(event.getUser(), event.getReason());
                if (com.travelhub.backend.enums.Role.AGENT.equals(event.getUser().getRole())) {
                    agentRepository.findByOwnerId(event.getUser().getId()).ifPresent(agent -> {
                        agentNotificationService.createNotification(agent, "account", "Account Rejected", "Your account verification was rejected. " + (event.getReason() != null ? event.getReason() : ""));
                    });
                }
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
            emailService.sendHotelStatusNotification(user.getEmail(), event.getHotel().getHotelName(), event.getType(), event.getReason());
        });
    }

    @Async
    @EventListener
    public void handlePackageEvent(PackageEvent event) {
        log.info("Handling package event: {} for package: {}", event.getType(), event.getPkg().getPackageName());

        if (event.getPkg().getAgent() != null && event.getPkg().getAgent().getOwner() != null) {
            emailService.sendPackageStatusNotification(event.getPkg().getAgent().getOwner().getEmail(), event.getPkg().getPackageName(), event.getType(), event.getReason());
            
            if ("APPROVED".equals(event.getType())) {
                agentNotificationService.createNotification(event.getPkg().getAgent(), "package", "Package Approved", "Your package " + event.getPkg().getPackageName() + " has been approved.");
            } else if ("REJECTED".equals(event.getType())) {
                agentNotificationService.createNotification(event.getPkg().getAgent(), "package", "Package Rejected", "Your package " + event.getPkg().getPackageName() + " has been rejected. " + (event.getReason() != null ? event.getReason() : ""));
            }
        }
    }

    @Async
    @EventListener
    public void handlePaymentEvent(com.travelhub.backend.event.PaymentEvent event) {
        log.info("Handling payment event: {} for payment ID: {}", event.getType(), event.getPayment().getId());
        
        if ("COMPLETED".equals(event.getType()) && event.getPayment().getAgent() != null) {
            agentNotificationService.createNotification(event.getPayment().getAgent(), "payment", "Payment Received", "You received a payment of $" + event.getPayment().getAmount() + " for booking " + event.getPayment().getBooking().getId() + ".");
        }
    }
}