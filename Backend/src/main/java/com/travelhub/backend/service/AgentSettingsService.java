package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.request.SettingsRequest;
import com.travelhub.backend.dto.response.SettingsResponse;
import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.entity.AgentSettings;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.AgentSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AgentSettingsService {

    private final AgentSettingsRepository agentSettingsRepository;
    private final AgentRepository agentRepository;

    public SettingsResponse getSettings(Long agentId) {
        AgentSettings settings = getOrCreateSettings(agentId);
        return toResponse(settings);
    }

    public SettingsResponse updateSettings(Long agentId, SettingsRequest request) {
        AgentSettings settings = getOrCreateSettings(agentId);

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

        if (request.getCurrency() != null) {
            settings.setCurrency(request.getCurrency());
        }

        return toResponse(agentSettingsRepository.save(settings));
    }

    // Creates default settings if agent has none yet
    private AgentSettings getOrCreateSettings(Long agentId) {
        return agentSettingsRepository.findByAgentId(agentId)
                .orElseGet(() -> {
                    Agent agent = agentRepository.findById(agentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Agent", "id", agentId));
                    AgentSettings newSettings = AgentSettings.builder()
                            .agent(agent)
                            .notifyNewBooking(true)
                            .notifyCancellation(true)
                            .notifyTripCompleted(true)
                            .notifyNewReview(true)
                            .notifyPaymentReceived(true)
                            .notifyPromoUpdates(false)
                            .currency("USD")
                            .build();
                    return agentSettingsRepository.save(newSettings);
                });
    }

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
