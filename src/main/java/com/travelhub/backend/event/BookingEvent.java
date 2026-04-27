package com.travelhub.backend.event;

import com.travelhub.backend.entity.Booking;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BookingEvent extends ApplicationEvent {
    private final Booking booking;
    private final String type; // e.g., "CREATED", "APPROVED", "DECLINED", "CANCELLED"
    private final String reason; // Optional reason for decline/cancellation

    public BookingEvent(Object source, Booking booking, String type, String reason) {
        super(source);
        this.booking = booking;
        this.type = type;
        this.reason = reason;
    }
}
