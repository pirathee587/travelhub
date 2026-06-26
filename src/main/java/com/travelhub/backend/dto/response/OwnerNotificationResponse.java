package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerNotificationResponse {
    private Long   id;
    private Long   hotelId;
    private String type;       // APPROVED | REJECTED | SUSPENDED
    private String title;
    private String message;
    private String time;
    private Boolean read;
}
