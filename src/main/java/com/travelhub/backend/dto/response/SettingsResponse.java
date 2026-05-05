package com.travelhub.backend.dto.response;

import java.util.Map;

public class SettingsResponse {
    private Map<String, Boolean> notificationPreferences;
    private String currency;

    public SettingsResponse() {}

    public Map<String, Boolean> getNotificationPreferences() { return notificationPreferences; }
    public void setNotificationPreferences(Map<String, Boolean> notificationPreferences) { this.notificationPreferences = notificationPreferences; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public static class Builder {
        private Map<String, Boolean> notificationPreferences;
        private String currency;

        public Builder notificationPreferences(Map<String, Boolean> notificationPreferences) { 
            this.notificationPreferences = notificationPreferences; 
            return this; 
        }
        public Builder currency(String currency) { this.currency = currency; return this; }

        public SettingsResponse build() {
            SettingsResponse r = new SettingsResponse();
            r.setNotificationPreferences(notificationPreferences);
            r.setCurrency(currency);
            return r;
        }
    }
    public static Builder builder() { return new Builder(); }
}