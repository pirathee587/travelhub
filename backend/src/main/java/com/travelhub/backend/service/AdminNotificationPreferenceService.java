package com.travelhub.backend.service;

import com.travelhub.backend.common.ResourceNotFoundException;
import com.travelhub.backend.dto.response.AdminNotificationPreferenceDto;
import com.travelhub.backend.entity.AdminNotificationPreference;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.repository.AdminNotificationPreferenceRepository;
import com.travelhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminNotificationPreferenceService {

    private final AdminNotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminNotificationPreferenceDto getPreferences(Long adminId) {
        if (adminId == null) {
            return AdminNotificationPreferenceDto.builder().build();
        }
        return preferenceRepository.findByAdminId(adminId)
                .map(AdminNotificationPreferenceDto::fromEntity)
                .orElseGet(() -> AdminNotificationPreferenceDto.builder().build());
    }

    @Transactional(readOnly = true)
    public AdminNotificationPreference getPreferencesEntity(Long adminId) {
        if (adminId == null) {
            return AdminNotificationPreference.builder()
                    .notifyAgentRegistrations(true)
                    .notifyHotelRegistrations(true)
                    .notifyPackageApprovals(true)
                    .notifyPaymentReceived(true)
                    .notifyTouristReports(true)
                    .notifySystemAlerts(true)
                    .build();
        }
        return preferenceRepository.findByAdminId(adminId)
                .orElseGet(() -> AdminNotificationPreference.builder()
                        .notifyAgentRegistrations(true)
                        .notifyHotelRegistrations(true)
                        .notifyPackageApprovals(true)
                        .notifyPaymentReceived(true)
                        .notifyTouristReports(true)
                        .notifySystemAlerts(true)
                        .build());
    }

    @Transactional
    public AdminNotificationPreferenceDto updatePreferences(Long adminId, AdminNotificationPreferenceDto dto) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        AdminNotificationPreference pref = preferenceRepository.findByAdminId(adminId)
                .orElseGet(() -> AdminNotificationPreference.builder()
                        .admin(admin)
                        .notifyAgentRegistrations(true)
                        .notifyHotelRegistrations(true)
                        .notifyPackageApprovals(true)
                        .notifyPaymentReceived(true)
                        .notifyTouristReports(true)
                        .notifySystemAlerts(true)
                        .build());

        if (dto.getAgentRegistrations() != null) {
            pref.setNotifyAgentRegistrations(dto.getAgentRegistrations());
        }
        if (dto.getHotelRegistrations() != null) {
            pref.setNotifyHotelRegistrations(dto.getHotelRegistrations());
        }
        if (dto.getPackageApprovals() != null) {
            pref.setNotifyPackageApprovals(dto.getPackageApprovals());
        }
        if (dto.getPaymentReceived() != null) {
            pref.setNotifyPaymentReceived(dto.getPaymentReceived());
        }
        if (dto.getTouristReports() != null) {
            pref.setNotifyTouristReports(dto.getTouristReports());
        }
        if (dto.getSystemAlerts() != null) {
            pref.setNotifySystemAlerts(dto.getSystemAlerts());
        }

        AdminNotificationPreference saved = preferenceRepository.save(pref);
        log.info("Updated notification preferences for admin ID: {}", adminId);
        return AdminNotificationPreferenceDto.fromEntity(saved);
    }
}
