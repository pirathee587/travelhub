package com.travelhub.backend.event;

import com.travelhub.backend.entity.Hotel;
import org.springframework.context.ApplicationEvent;

/**
 * HotelEvent is a domain event triggered when a hotel property's platform status changes.
 * It facilitates asynchronous notifications to property owners regarding administrative decisions.
 */
public class HotelEvent extends ApplicationEvent {
    
    private final Hotel  hotel;
    private final String type; // The state transition identifier (e.g., "APPROVED", "REJECTED")
    private final String reason; // Optional explanatory text for the state change

    // Getters for event metadata
    public Hotel getHotel() { return hotel; }
    public String getType() { return type; }
    public String getReason() { return reason; }

    /**
     * Standard constructor for simple status changes (e.g., approval).
     */
    public HotelEvent(Object source, Hotel hotel, String type) {
        super(source);
        this.hotel  = hotel;
        this.type   = type;
        this.reason = null;
    }

    /**
     * Comprehensive constructor for events requiring additional context (e.g., rejection reasoning).
     */
    public HotelEvent(Object source,
                      Hotel hotel,
                      String type,
                      String reason) {
        super(source);
        this.hotel  = hotel;
        this.type   = type;
        this.reason = reason;
    }
}