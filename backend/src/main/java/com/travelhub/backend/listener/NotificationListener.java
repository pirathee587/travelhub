package com.travelhub.backend.listener;

import com.travelhub.backend.event.BookingEvent;
import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.event.PaymentEvent;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.repository.AgentSettingsRepository;
import com.travelhub.backend.entity.AgentSettings;
import com.travelhub.backend.service.EmailService;
import com.travelhub.backend.service.UserNotificationService;
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
    private final UserNotificationService userNotificationService;
    private final AgentSettingsRepository agentSettingsRepository;

    @Async
    @EventListener
    public void handleBookingEvent(BookingEvent event) {
        log.info("Handling booking event: {} for booking ID: {}", event.getType(), event.getBooking().getId());
        
        var booking = event.getBooking();
        String bookingRef = "BK" + String.format("%05d", booking.getId());
        String pkgName = booking.getPkg() != null ? booking.getPkg().getPackageName() : "a package";

        switch (event.getType()) {
            case "CREATED":
                emailService.sendBookingConfirmation(event.getBooking());
                if (event.getBooking().getPkg() != null && event.getBooking().getPkg().getAgent() != null) {
                    var agent = event.getBooking().getPkg().getAgent();
                    if (shouldNotify(agent, "new-booking")) {
                        emailService.sendAgentBookingNotification(event.getBooking());
                        agentNotificationService.createNotification(agent, "booking", "New Booking Request", "You have a new booking request for package " + event.getBooking().getPkg().getPackageName() + ".");
                    }
                }
                break;
            case "APPROVED":
                emailService.sendBookingApprovalNotification(booking);
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(booking.getUser().getId(), "booking", "Booking Approved", "Your booking " + bookingRef + " for " + pkgName + " has been approved. Please complete the payment.", "/tourist/trips");
                }
                break;
            case "DECLINED":
                emailService.sendBookingDeclineNotification(booking, event.getReason());
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(booking.getUser().getId(), "booking", "Booking Declined", "Your booking " + bookingRef + " for " + pkgName + " has been declined. Reason: " + (event.getReason() != null ? event.getReason() : "None"), "/tourist/trips");
                }
                break;
            case "STARTED":
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(booking.getUser().getId(), "booking", "Trip Started", "Your trip " + bookingRef + " for " + pkgName + " has officially started! Have a great journey.", "/tourist/trips");
                }
                break;
            case "COMPLETED":
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(booking.getUser().getId(), "booking", "Trip Completed", "Your trip " + bookingRef + " for " + pkgName + " is completed! Tap here to leave a review for your experience.", "/tourist/trips");
                }
                if (booking.getPkg() != null && booking.getPkg().getAgent() != null) {
                    var agent = booking.getPkg().getAgent();
                    if (shouldNotify(agent, "trip-completed")) {
                        agentNotificationService.createNotification(agent, "booking", "Trip Completed", "Trip " + bookingRef + " for package " + pkgName + " has been completed.");
                    }
                }
                break;
            case "CANCELLED":
                if (booking.getUser() != null) {
                    userNotificationService.notifyUser(booking.getUser().getId(), "booking", "Booking Cancelled", "Booking " + bookingRef + " for " + pkgName + " was cancelled.", "/tourist/trips");
                }
                if (booking.getPkg() != null && booking.getPkg().getAgent() != null) {
                    var agent = booking.getPkg().getAgent();
                    if (shouldNotify(agent, "cancellation")) {
                        agentNotificationService.createNotification(agent, "cancellation", "Booking Cancelled", "Booking " + bookingRef + " for package " + pkgName + " was cancelled.");
                    }
                }
                break;
        }
    }

    @Async
    @EventListener
    public void handlePaymentEvent(PaymentEvent event) {
        log.info("Handling payment event: {} for payment ID: {}", event.getType(), event.getPayment().getId());
        if ("COMPLETED".equalsIgnoreCase(event.getType())) {
            emailService.sendPaymentConfirmation(event.getPayment());
            if (event.getPayment().getAgent() != null) {
                var agent = event.getPayment().getAgent();
                if (shouldNotify(agent, "payment-received")) {
                    agentNotificationService.createNotification(agent, "payment", "Payment Received", "You received a payment of $" + event.getPayment().getAmount() + " for booking " + event.getPayment().getBooking().getId() + ".");
                }
            }
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

    private boolean shouldNotify(com.travelhub.backend.entity.Agent agent, String preference) {
        if (agent == null) return false;
        return agentSettingsRepository.findByAgentId(agent.getId())
                .map(settings -> {
                    switch (preference) {
                        case "new-booking":
                            return settings.getNotifyNewBooking();
                        case "cancellation":
                            return settings.getNotifyCancellation();
                        case "trip-completed":
                            return settings.getNotifyTripCompleted();
                        case "new-review":
                            return settings.getNotifyNewReview();
                        case "payment-received":
                            return settings.getNotifyPaymentReceived();
                        case "promo-updates":
                            return settings.getNotifyPromoUpdates();
                        default:
                            return true;
                    }
                })
                .orElseGet(() -> !"promo-updates".equals(preference)); // default fallback: true for all except promo-updates
    }
}