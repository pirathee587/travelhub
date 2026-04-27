package com.travelhub.backend.event;

import com.travelhub.backend.entity.Hotel;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class HotelEvent extends ApplicationEvent {
    private final Hotel hotel;
    private final String type; // e.g., "APPROVED", "REJECTED", "DELETED"
    private final String reason;

    public HotelEvent(Object source, Hotel hotel, String type, String reason) {
        super(source);
        this.hotel = hotel;
        this.type = type;
        this.reason = reason;
    }
}
