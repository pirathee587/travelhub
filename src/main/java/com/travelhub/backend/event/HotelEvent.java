package com.travelhub.backend.event;

import com.travelhub.backend.entity.Hotel;
import org.springframework.context.ApplicationEvent;


public class HotelEvent extends ApplicationEvent {
    
    public Hotel getHotel() { return hotel; }
    public String getType() { return type; }
    public String getReason() { return reason; }

    private final Hotel  hotel;
    private final String type;
    private final String reason;

    // ✅ Without reason — APPROVED
    public HotelEvent(Object source, Hotel hotel, String type) {
        super(source);
        this.hotel  = hotel;
        this.type   = type;
        this.reason = null;
    }


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