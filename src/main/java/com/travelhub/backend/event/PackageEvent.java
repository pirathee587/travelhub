package com.travelhub.backend.event;

import com.travelhub.backend.entity.Package;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class PackageEvent extends ApplicationEvent {
    private final Package pkg;
    private final String type; // e.g., "APPROVED", "REJECTED", "DELETED"
    private final String reason;

    public PackageEvent(Object source, Package pkg, String type) {
        this(source, pkg, type, null);
    }

    public PackageEvent(Object source, Package pkg, String type, String reason) {
        super(source);
        this.pkg = pkg;
        this.type = type;
        this.reason = reason;
    }
}
