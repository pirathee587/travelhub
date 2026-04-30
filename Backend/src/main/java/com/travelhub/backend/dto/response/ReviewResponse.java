package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ReviewResponse {
    private Long id;

    // ✅ Frontend PackageDetails & HotelDetails use `review.userName`
    private String userName;

    // ✅ Frontend uses `review.reviewDate`
    private String reviewDate;

    private Integer rating;

    // ✅ Frontend uses `review.title`
    private String title;

    private String comment;

    // ✅ Frontend renders `review.imageUrls` array
    private List<String> imageUrls;

    // kept for agent dashboard / other consumers
    private String customerName;
    private String date;
    private String trip;
    private String packageName;
    private String reply;
    private Boolean hasReply;
}
