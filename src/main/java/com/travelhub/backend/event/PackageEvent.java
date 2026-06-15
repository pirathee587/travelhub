package com.travelhub.backend.event;

import com.travelhub.backend.entity.Package;
import org.springframework.context.ApplicationEvent;

/**
 * PackageEvent is a domain event triggered when a travel package's platform status changes.
 * It facilitates asynchronous notifications to travel agents regarding administrative decisions.
 */
public class PackageEvent extends ApplicationEvent {
    
    private final Package pkg;
    private final String  type; // The state transition identifier (e.g., "APPROVED", "REJECTED")
    private final String  reason; // Optional explanatory text for the state change

    // Getters for event metadata
    public Package getPkg() { return pkg; }
    public String getType() { return type; }
    public String getReason() { return reason; }

    /**
     * Standard constructor for simple status changes (e.g., approval or deletion).
     */
    public PackageEvent(Object source, Package pkg, String type) {
        super(source);
        this.pkg    = pkg;
        this.type   = type;
        this.reason = null;
    }

    /**
     * Comprehensive constructor for events requiring additional context (e.g., rejection reasoning).
     */
    public PackageEvent(Object source,
                        Package pkg,
                        String type,
                        String reason) {
        super(source);
        this.pkg    = pkg;
        this.type   = type;
        this.reason = reason;
    }
}