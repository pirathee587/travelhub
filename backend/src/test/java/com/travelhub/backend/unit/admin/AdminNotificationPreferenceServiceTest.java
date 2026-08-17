package com.travelhub.backend.unit.admin;

import com.travelhub.backend.dto.response.AdminNotificationPreferenceDto;
import com.travelhub.backend.entity.AdminNotificationPreference;
import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.repository.AdminNotificationPreferenceRepository;
import com.travelhub.backend.repository.UserRepository;
import com.travelhub.backend.service.AdminNotificationPreferenceService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AdminNotificationPreferenceServiceTest {

    @Mock
    private AdminNotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminNotificationPreferenceService preferenceService;

    @Test(description = "getPreferences should return defaults when no preferences exist")
    public void getPreferences_ShouldReturnDefaults_WhenNoneExist() {
        when(preferenceRepository.findByAdminId(1L)).thenReturn(Optional.empty());

        AdminNotificationPreferenceDto result = preferenceService.getPreferences(1L);

        assertNotNull(result);
        assertTrue(result.getAgentRegistrations());
        assertTrue(result.getHotelRegistrations());
    }

    @Test(description = "getPreferences should return saved entity when exists")
    public void getPreferences_ShouldReturnSaved_WhenExist() {
        AdminNotificationPreference pref = AdminNotificationPreference.builder()
                .notifyAgentRegistrations(false)
                .notifyHotelRegistrations(true)
                .build();
        when(preferenceRepository.findByAdminId(1L)).thenReturn(Optional.of(pref));

        AdminNotificationPreferenceDto result = preferenceService.getPreferences(1L);

        assertNotNull(result);
        assertFalse(result.getAgentRegistrations());
        assertTrue(result.getHotelRegistrations());
    }

    @Test(description = "updatePreferences should save and return updated preferences")
    public void updatePreferences_ShouldSaveAndReturnUpdated() {
        User admin = User.builder().id(1L).role(Role.ADMIN).build();
        AdminNotificationPreference pref = AdminNotificationPreference.builder()
                .admin(admin)
                .notifyAgentRegistrations(true)
                .notifyHotelRegistrations(true)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(preferenceRepository.findByAdminId(1L)).thenReturn(Optional.of(pref));
        when(preferenceRepository.save(any(AdminNotificationPreference.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminNotificationPreferenceDto updateDto = AdminNotificationPreferenceDto.builder()
                .agentRegistrations(false)
                .build();

        AdminNotificationPreferenceDto result = preferenceService.updatePreferences(1L, updateDto);

        assertNotNull(result);
        assertFalse(result.getAgentRegistrations());
        assertTrue(result.getHotelRegistrations());
        verify(preferenceRepository, times(1)).save(any(AdminNotificationPreference.class));
    }
}
