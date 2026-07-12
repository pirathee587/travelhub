package com.travelhub.backend.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewResponse {
    private Long id;

    //  Frontend PackageDetails & HotelDetails use `review.userName`
    private String userName;

    //  Frontend uses `review.reviewDate`
    private String reviewDate;

    private Integer rating;

    //  Frontend uses `review.title`
    private String title;

    private String comment;

    //  Frontend renders `review.imageUrls` array
    private List<String> imageUrls;

    // kept for agent dashboard / other consumers
    private String customerName;
    private String customerProfileImage; // o. NEW: For displaying tourist's image
    private String date;
    private String trip;
    private String packageName;
    private Long packageId;          // ✅ NEW: For navigation to package details
    private String hotelName;        // ✅ NEW: For hotel reviews
    private Long hotelId;            // ✅ NEW: For navigation to hotel details
    private String district;         // ✅ NEW: For package/hotel district information
    private String reply;
    private Boolean hasReply;
}