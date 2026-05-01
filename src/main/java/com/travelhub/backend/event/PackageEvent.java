package com.travelhub.backend.event;

import com.travelhub.backend.entity.Package;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PackageEvent extends ApplicationEvent {

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