package com.travelhub.backend.dto.request;



public class BookingActionRequest {
    private String declineReason; // only used when declining

    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }

    public BookingActionRequest() {}
}