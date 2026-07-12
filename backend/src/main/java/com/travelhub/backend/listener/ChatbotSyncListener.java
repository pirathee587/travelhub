package com.travelhub.backend.listener;

import com.travelhub.backend.event.HotelEvent;
import com.travelhub.backend.event.PackageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

/**
 * ✅ CHATBOT SYNC LISTENER: Notifies Python chatbot service of real-time database changes.
 * 
 * When packages or hotels are created, updated, or deleted in the backend,
 * this listener immediately sends a notification to the Python chatbot service.
 * The chatbot then syncs the latest data within seconds, ensuring recommendations
 * are always based on current database state.
 * 
 * This enables the dynamic website requirement where chatbot data must reflect
 * continuous database updates rather than stale cached snapshots.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ChatbotSyncListener {

    private final RestTemplate restTemplate;

    @Value("${chatbot.service.url:http://localhost:8001}")
    private String chatbotServiceUrl;

    @Async
    @EventListener
    public void handleHotelEvent(HotelEvent event) {
        log.info("[ChatbotSync] Hotel event triggered: {} for hotel: {}", 
            event.getType(), event.getHotel().getHotelName());

        // Only sync on meaningful changes
        if (shouldSyncHotel(event.getType())) {
            notifyChatbotOfUpdate("hotel", event.getType());
        }
    }

    @Async
    @EventListener
    public void handlePackageEvent(PackageEvent event) {
        log.info("[ChatbotSync] Package event triggered: {} for package: {}", 
            event.getType(), event.getPkg().getPackageName());

        // Only sync on meaningful changes
        if (shouldSyncPackage(event.getType())) {
            notifyChatbotOfUpdate("package", event.getType());
        }
    }

    /**
     * Sends real-time notification to Python chatbot service.
     * Triggers immediate sync instead of waiting for 5-minute interval.
     */
    private void notifyChatbotOfUpdate(String type, String action) {
        try {
            String notifyUrl = chatbotServiceUrl + "/notify-update";
            String payload = String.format("{\"type\": \"%s\", \"action\": \"%s\"}", type, action);

            log.debug("[ChatbotSync] Sending push notification to: {}", notifyUrl);
            log.debug("[ChatbotSync] Payload: {}", payload);

            restTemplate.postForObject(
                notifyUrl,
                payload,
                Object.class
            );

            log.info("[ChatbotSync] ✅ Chatbot notified of {} {} - will sync immediately", type, action);

        } catch (RestClientException e) {
            // Don't fail the main operation if chatbot is temporarily unavailable
            log.warn("[ChatbotSync] ⚠️  Failed to notify chatbot service: {}. " +
                    "Will retry on next 5-minute auto-sync cycle.", e.getMessage());
        } catch (Exception e) {
            log.error("[ChatbotSync] ❌ Unexpected error notifying chatbot: ", e);
        }
    }

    /**
     * Determines if hotel event should trigger chatbot sync.
     * Only sync on create/update, not on minor events.
     */
    private boolean shouldSyncHotel(String eventType) {
        return eventType != null && (
            eventType.equals("CREATED") ||
            eventType.equals("UPDATED") ||
            eventType.equals("APPROVED") ||
            eventType.equals("ACTIVATED") ||
            eventType.equals("DEACTIVATED")
        );
    }

    /**
     * Determines if package event should trigger chatbot sync.
     * Only sync on create/update/delete, not on minor events.
     */
    private boolean shouldSyncPackage(String eventType) {
        return eventType != null && (
            eventType.equals("CREATED") ||
            eventType.equals("UPDATED") ||
            eventType.equals("DELETED") ||
            eventType.equals("ACTIVATED") ||
            eventType.equals("DEACTIVATED")
        );
    }
}
