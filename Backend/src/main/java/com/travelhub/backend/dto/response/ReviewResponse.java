package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String customerName;
    private Integer rating;
    private String comment;
    private String date;
    private String trip;
    private String packageName;
    private String reply;
    private Boolean hasReply;
}