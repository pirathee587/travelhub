package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class SettingsResponse {
    private Map<String, Boolean> notificationPreferences;
    private String currency;
}