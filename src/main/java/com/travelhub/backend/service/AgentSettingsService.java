package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.SettingsRequest;
import com.travelhub.backend.dto.response.SettingsResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.AgentSettings;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.AgentSettingsRepository;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * AgentSettingsService manages the personalized configuration and communication preferences for travel agents.
 * It handles notification toggles for operational events and localized display settings like currency.
 */
@Service
public class AgentSettingsService {

    private final AgentSettingsRepository agentSettingsRepository;
    private final AgentRepository agentRepository;

    /**
     * Constructor injection for settings and agent repositories.
     */
    public AgentSettingsService(AgentSettingsRepository agentSettingsRepository, AgentRepository agentRepository) {
        this.agentSettingsRepository = agentSettingsRepository;
        this.agentRepository = agentRepository;
    }

    /**
     * Retrieves the current settings for an agent.
     * Uses a lazy-creation strategy if settings don't already exist.
     */
    public SettingsResponse getSettings(Long agentId) {
        AgentSettings settings = getOrCreateSettings(agentId);
        return toResponse(settings);
    }

    /**
     * Updates an agent's preferences.
     * Parses a map of notification toggles and synchronizes them with the persistent entity.
     */
    public SettingsResponse updateSettings(Long agentId, SettingsRequest request) {
        AgentSettings settings = getOrCreateSettings(agentId);

        // Granular update for notification preferences
        if (request.getNotificationPreferences() != null) {
            Map<String, Boolean> prefs = request.getNotificationPreferences();
            if (prefs.containsKey("new-booking"))
                settings.setNotifyNewBooking(prefs.get("new-booking"));
            if (prefs.containsKey("cancellation"))
                settings.setNotifyCancellation(prefs.get("cancellation"));
            if (prefs.containsKey("trip-completed"))
                settings.setNotifyTripCompleted(prefs.get("trip-completed"));
            if (prefs.containsKey("new-review"))
                settings.setNotifyNewReview(prefs.get("new-review"));
            if (prefs.containsKey("payment-received"))
                settings.setNotifyPaymentReceived(prefs.get("payment-received"));
            if (prefs.containsKey("promo-updates"))
                settings.setNotifyPromoUpdates(prefs.get("promo-updates"));
        }

        // Update localization settings
        if (request.getCurrency() != null) {
            settings.setCurrency(request.getCurrency());
        }

        return toResponse(agentSettingsRepository.save(settings));
    }

    /**
     * Ensures an AgentSettings record exists for the given agent.
     * If missing, initializes default system preferences (e.g., all operational alerts enabled, promo alerts disabled).
     */
    private AgentSettings getOrCreateSettings(Long agentId) {
        return agentSettingsRepository.findByAgentId(agentId)
                .orElseGet(() -> {
                    Agent agent = agentRepository.findById(agentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
                    
                    // Initialize with platform defaults
                    AgentSettings newSettings = AgentSettings.builder()
                            .agent(agent)
                            .notifyNewBooking(true)
                            .notifyCancellation(true)
                            .notifyTripCompleted(true)
                            .notifyNewReview(true)
                            .notifyPaymentReceived(true)
                            .notifyPromoUpdates(false) // Marketing opt-in disabled by default
                            .currency("USD")
                            .build();
                    return agentSettingsRepository.save(newSettings);
                });
    }

    /**
     * Maps the AgentSettings entity to a structured response DTO.
     * Consolidates individual boolean flags into a LinkedHashMap for easier iteration by the frontend.
     */
    private SettingsResponse toResponse(AgentSettings s) {
        Map<String, Boolean> prefs = new LinkedHashMap<>();
        prefs.put("new-booking", s.getNotifyNewBooking());
        prefs.put("cancellation", s.getNotifyCancellation());
        prefs.put("trip-completed", s.getNotifyTripCompleted());
        prefs.put("new-review", s.getNotifyNewReview());
        prefs.put("payment-received", s.getNotifyPaymentReceived());
        prefs.put("promo-updates", s.getNotifyPromoUpdates());

        return SettingsResponse.builder()
                .notificationPreferences(prefs)
                .currency(s.getCurrency())
                .build();
    }
}
