package com.travelhub.backend.dto.request;

import java.util.Map;


public class SettingsRequest {
    private Map<String, Boolean> notificationPreferences;
    private String currency;

    public Map<String, Boolean> getNotificationPreferences() { return notificationPreferences; }
    public void setNotificationPreferences(Map<String, Boolean> notificationPreferences) { this.notificationPreferences = notificationPreferences; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public SettingsRequest() {}
}