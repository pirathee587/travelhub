package com.travelhub.backend.event;

import com.travelhub.backend.entity.User;
import org.springframework.context.ApplicationEvent;

/**
 * UserAccountEvent is a domain event triggered during various stages of a user's lifecycle.
 * It coordinates side effects like email verification, password resets, and administrative status notifications.
 */
public class UserAccountEvent extends ApplicationEvent {
    
    private final User user;
    private final String type; // The state transition identifier (e.g., "REGISTERED", "APPROVED")
    private final String token; // Cryptographic token for verification/reset flows
    private final String reason; // Explanatory text for administrative actions (e.g., rejection reason)

    // Getters for event metadata
    public User getUser() { return user; }
    public String getType() { return type; }
    public String getToken() { return token; }
    public String getReason() { return reason; }

    /**
     * Minimal constructor for simple status changes without additional tokens or reasons.
     */
    public UserAccountEvent(Object source, User user, String type) {
        this(source, user, type, null, null);
    }

    /**
     * Flexible constructor to handle events with either a token or a reason.
     * Logic:
     * - If type is 'REJECTED', the second parameter is treated as the 'reason'.
     * - For other types (e.g., 'REGISTERED'), it is treated as the security 'token'.
     */
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

    /**
     * Comprehensive constructor for events requiring both a token and a reason.
     */
    public UserAccountEvent(Object source, User user, String type, String token, String reason) {
        super(source);
        this.user = user;
        this.type = type;
        this.token = token;
        this.reason = reason;
    }
}
