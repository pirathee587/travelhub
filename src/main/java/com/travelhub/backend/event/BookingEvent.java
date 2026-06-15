package com.travelhub.backend.event;

import com.travelhub.backend.entity.Booking;
import org.springframework.context.ApplicationEvent;

/**
 * BookingEvent is a domain event triggered when a reservation's state changes.
 * It is published by the service layer and consumed by listeners to trigger side effects like email dispatch.
 */
public class BookingEvent extends ApplicationEvent {
    
    private final Booking booking;
    private final String  type;
    private final String  reason;

    // Getters for event metadata
    public Booking getBooking() { return booking; }
    public String getType() { return type; }
    public String getReason() { return reason; }

    /**
     * Constructor for standard lifecycle events (e.g., CREATED, APPROVED).
     * @param source The object that published the event.
     * @param booking The reservation entity associated with the event.
     * @param type The specific state transition (e.g., "CREATED").
     */
    public BookingEvent(Object source,
                        Booking booking,
                        String type) {
        super(source);
        this.booking = booking;
        this.type    = type;
        this.reason  = null;
    }

    /**
     * Constructor for events requiring additional context (e.g., DECLINED, CANCELLED).
     * @param reason The explanatory text for the state change (e.g., rejection reason).
     */
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