package com.travelhub.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.travelhub.backend.entity.AdminNotificationPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationPreferenceDto {

    @JsonProperty("agent-registrations")
    @JsonAlias({"agentRegistrations", "agent-registrations", "notifyAgentRegistrations"})
    @Builder.Default
    private Boolean agentRegistrations = true;

    @JsonProperty("hotel-registrations")
    @JsonAlias({"hotelRegistrations", "hotel-registrations", "notifyHotelRegistrations"})
    @Builder.Default
    private Boolean hotelRegistrations = true;

    @JsonProperty("package-approvals")
    @JsonAlias({"packageApprovals", "package-approvals", "notifyPackageApprovals"})
    @Builder.Default
    private Boolean packageApprovals = true;

    @JsonProperty("payment-received")
    @JsonAlias({"paymentReceived", "payment-received", "notifyPaymentReceived"})
    @Builder.Default
    private Boolean paymentReceived = true;

    @JsonProperty("tourist-reports")
    @JsonAlias({"touristReports", "tourist-reports", "notifyTouristReports"})
    @Builder.Default
    private Boolean touristReports = true;

    @JsonProperty("system-alerts")
    @JsonAlias({"systemAlerts", "system-alerts", "notifySystemAlerts"})
    @Builder.Default
    private Boolean systemAlerts = true;

    public static AdminNotificationPreferenceDto fromEntity(AdminNotificationPreference entity) {
        if (entity == null) {
            return AdminNotificationPreferenceDto.builder().build(); // all defaults true
        }
        return AdminNotificationPreferenceDto.builder()
                .agentRegistrations(entity.getNotifyAgentRegistrations() != null ? entity.getNotifyAgentRegistrations() : true)
                .hotelRegistrations(entity.getNotifyHotelRegistrations() != null ? entity.getNotifyHotelRegistrations() : true)
                .packageApprovals(entity.getNotifyPackageApprovals() != null ? entity.getNotifyPackageApprovals() : true)
                .paymentReceived(entity.getNotifyPaymentReceived() != null ? entity.getNotifyPaymentReceived() : true)
                .touristReports(entity.getNotifyTouristReports() != null ? entity.getNotifyTouristReports() : true)
                .systemAlerts(entity.getNotifySystemAlerts() != null ? entity.getNotifySystemAlerts() : true)
                .build();
    }

    public Map<String, Boolean> toMap() {
        Map<String, Boolean> map = new HashMap<>();
        map.put("agent-registrations", Boolean.TRUE.equals(agentRegistrations));
        map.put("hotel-registrations", Boolean.TRUE.equals(hotelRegistrations));
        map.put("package-approvals", Boolean.TRUE.equals(packageApprovals));
        map.put("payment-received", Boolean.TRUE.equals(paymentReceived));
        map.put("tourist-reports", Boolean.TRUE.equals(touristReports));
        map.put("system-alerts", Boolean.TRUE.equals(systemAlerts));
        return map;
    }
}
