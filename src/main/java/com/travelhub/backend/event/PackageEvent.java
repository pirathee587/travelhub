package com.travelhub.backend.event;

import com.travelhub.backend.entity.Package;
import org.springframework.context.ApplicationEvent;


public class PackageEvent extends ApplicationEvent {
    
    public Package getPkg() { return pkg; }
    public String getType() { return type; }
    public String getReason() { return reason; }

    private final Package pkg;
    private final String  type;
    private final String  reason;

    // ✅ Without reason — APPROVED, DELETED
    public PackageEvent(Object source, Package pkg, String type) {
        super(source);
        this.pkg    = pkg;
        this.type   = type;
        this.reason = null;
    }

    // ✅ With reason — REJECTED
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