package com.travelhub.backend.event;

import com.travelhub.backend.entity.Booking;
import org.springframework.context.ApplicationEvent;


public class BookingEvent extends ApplicationEvent {
    
    public Booking getBooking() { return booking; }
    public String getType() { return type; }
    public String getReason() { return reason; }

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