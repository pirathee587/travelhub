package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminBookingResponse {
    private Long id;
    private String bookingId;
    private String touristName;
    private String touristEmail;
    private String packageName;
    private String agentName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double totalPrice;
    private LocalDateTime bookedOn;
    private Integer adults;
    private Integer children;
}
