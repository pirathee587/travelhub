package com.travelhub.backend.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long userId;
    private String userName;
    private String title;
    private String comment;
    private Integer rating;
}