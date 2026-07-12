package com.travelhub.backend.event;

import com.travelhub.backend.entity.Payment;
import org.springframework.context.ApplicationEvent;

public class PaymentEvent extends ApplicationEvent {

    private final Payment payment;
    private final String type;

    public PaymentEvent(Object source, Payment payment, String type) {
        super(source);
        this.payment = payment;
        this.type = type;
    }

    public Payment getPayment() { return payment; }
    public String getType() { return type; }
}
