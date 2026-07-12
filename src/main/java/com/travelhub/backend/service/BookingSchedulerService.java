package com.travelhub.backend.service;

import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.Booking;
import com.travelhub.backend.entity.Notification;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs daily at 8:00 AM to check bookings and create in-app notifications
 * for the agent. Does NOT auto-change any status — the agent is always in control.
 *
 * Two scenarios handled:
 *  1. "confirmed" bookings whose startDate is today → "Trip Starting Today" notification
 *  2. "in_progress" bookings whose endDate has passed → "Trip Ended" notification
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingSchedulerService {

    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;

    // ── Runs every day at 08:00 AM ────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyTripStartReminders() {
        LocalDate today = LocalDate.now();
        List<Booking> dueToStart = bookingRepository.findConfirmedBookingsDueToStart(today);

        for (Booking booking : dueToStart) {
            Agent agent = booking.getVehicle().getAgent();
            String packageName = booking.getPkg() != null
                    ? booking.getPkg().getPackageName()
                    : "Trip #" + booking.getId();

            // Avoid duplicate notifications for the same booking on the same day
            // by checking if we already sent one today (simple: check if a start reminder exists)
            boolean alreadyNotified = notificationRepository
                    .findByAgentIdOrderByCreatedAtDesc(agent.getId())
                    .stream()
                    .anyMatch(n -> n.getType().equals("trip_start")
                            && n.getMessage().contains("BK" + String.format("%05d", booking.getId())));

            if (!alreadyNotified) {
                Notification notification = Notification.builder()
                        .agent(agent)
                        .type("trip_start")
                        .title("Trip Starting Today")
                        .message(String.format(
                                "Booking BK%05d — \"%s\" is scheduled to start today (%s). " +
                                "Please go to Bookings and click 'Start Trip' to confirm it has begun.",
                                booking.getId(), packageName, booking.getStartDate()))
                        .read(false)
                        .build();

                notificationRepository.save(notification);
                log.info("Trip start notification created for booking {} (agent {})",
                        booking.getId(), agent.getId());
            }
        }
    }

    // ── Runs every day at 08:00 AM ────────────────────────────────────────────
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyTripEndReminders() {
        LocalDate today = LocalDate.now();
        List<Booking> pastEndDate = bookingRepository.findInProgressBookingsPastEndDate(today);

        for (Booking booking : pastEndDate) {
            Agent agent = booking.getVehicle().getAgent();
            String packageName = booking.getPkg() != null
                    ? booking.getPkg().getPackageName()
                    : "Trip #" + booking.getId();

            boolean alreadyNotified = notificationRepository
                    .findByAgentIdOrderByCreatedAtDesc(agent.getId())
                    .stream()
                    .anyMatch(n -> n.getType().equals("trip_end")
                            && n.getMessage().contains("BK" + String.format("%05d", booking.getId())));

            if (!alreadyNotified) {
                Notification notification = Notification.builder()
                        .agent(agent)
                        .type("trip_end")
                        .title("Trip Completion Needed")
                        .message(String.format(
                                "Booking BK%05d — \"%s\" was scheduled to end on %s. " +
                                "Please go to Bookings and click 'Complete Trip' once the trip has finished.",
                                booking.getId(), packageName, booking.getEndDate()))
                        .read(false)
                        .build();

                notificationRepository.save(notification);
                log.info("Trip end notification created for booking {} (agent {})",
                        booking.getId(), agent.getId());
            }
        }
    }
}
