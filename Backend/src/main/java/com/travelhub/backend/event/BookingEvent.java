package com.travelhub.backend.event;

import com.travelhub.backend.entity.Booking;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingEvent extends ApplicationEvent {

    private final Booking booking;
    private final String  type;
    private final String  reason;

    // ✅ Without reason — CREATED, APPROVED
    public BookingEvent(Object source,
                        Booking booking,
                        String type) {
        super(source);
        this.booking = booking;
        this.type    = type;
        this.reason  = null;
    }

    // ✅ With reason — DECLINED, CANCELLED
    public BookingEvent(Object source,
                        Booking booking,
                        String type,
                        String reason) {
        super(source);
        this.booking = booking;
        this.type    = type;
        this.reason  = reason;
    }
}