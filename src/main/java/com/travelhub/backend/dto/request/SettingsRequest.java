package com.travelhub.backend.dto.request;

import lombok.Data;
import java.util.Map;

@Data
public class SettingsRequest {
    private Map<String, Boolean> notificationPreferences;
    private String currency;
}