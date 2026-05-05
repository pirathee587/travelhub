package com.travelhub.backend.listener;

import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.EmailService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationListener.class);
    private final EmailService emailService;
    private final UserRepository userRepository;

    public NotificationListener(EmailService emailService, UserRepository userRepository) {
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

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

        if (event.getHotel().getOwner() != null) {
            emailService.sendHotelStatusNotification(event.getHotel().getOwner().getEmail(), event.getHotel().getHotelName(), event.getType(), event.getReason());
        }
    }

    @Async
    @EventListener
    public void handlePackageEvent(PackageEvent event) {
        log.info("Handling package event: {} for package: {}", event.getType(), event.getPkg().getPackageName());

        if (event.getPkg().getAgent() != null) {
            emailService.sendPackageStatusNotification(event.getPkg().getAgent().getUser().getEmail(), event.getPkg().getPackageName(), event.getType(), event.getReason());
        }
    }
}