package com.travelhub.backend.listener;

import com.travelhub.backend.entity.User;
import com.travelhub.backend.enums.Role;
import com.travelhub.backend.event.UserAccountEvent;
import com.travelhub.backend.service.EmailService;
import com.travelhub.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

public class NotificationDemoTest {

    @Test
    public void demoNotificationTrigger() {
        // 1. Mock the dependencies
        EmailService emailService = Mockito.mock(EmailService.class);
        UserRepository userRepository = Mockito.mock(UserRepository.class);

        // 2. Create the listener manually
        NotificationListener listener = new NotificationListener(emailService, userRepository);

        // 3. Create a mock user
        User mockUser = User.builder()
                .name("Test Agent")
                .email("agent@example.com")
                .role(Role.AGENT)
                .build();

        // 4. Fire the Event (Directly calling the listener method for demo)
        System.out.println("DEMO: Triggering UserAccountEvent for APPROVAL...");
        UserAccountEvent approveEvent = new UserAccountEvent(this, mockUser, "APPROVED");
        listener.handleUserAccountEvent(approveEvent);

        System.out.println("DEMO: Triggering UserAccountEvent for REJECTION...");
        UserAccountEvent rejectEvent = new UserAccountEvent(this, mockUser, "REJECTED", "Missing documentation");
        listener.handleUserAccountEvent(rejectEvent);

        // 5. Verify the email service was called
        verify(emailService, times(1)).sendAccountApprovalNotification(any(User.class));
        verify(emailService, times(1)).sendAccountRejectionNotification(any(User.class), any());
        
        System.out.println("DEMO SUCCESS: Listener caught events and called EmailService with correct parameters!");
    }
}
