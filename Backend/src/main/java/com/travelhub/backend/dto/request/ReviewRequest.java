package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private String userName;   // frontend sends this for display name
    private String title;      // frontend sends this field
    private String comment;
    private Integer rating;
}
