package com.travelhub.backend.event;

import com.travelhub.backend.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class UserAccountEvent extends ApplicationEvent {
    private final User user;
    private final String type; // e.g., "REGISTERED", "APPROVED", "REJECTED", "PASSWORD_RESET"
    private final String token; // Optional token for verification/reset
    private final String reason; // Optional reason for rejection

    public UserAccountEvent(Object source, User user, String type) {
        this(source, user, type, null, null);
    }

    public UserAccountEvent(Object source, User user, String type, String tokenOrReason) {
        super(source);
        this.user = user;
        this.type = type;
        if ("REJECTED".equals(type)) {
            this.reason = tokenOrReason;
            this.token = null;
        } else {
            this.token = tokenOrReason;
            this.reason = null;
        }
    }

    public UserAccountEvent(Object source, User user, String type, String token, String reason) {
        super(source);
        this.user = user;
        this.type = type;
        this.token = token;
        this.reason = reason;
    }
}
