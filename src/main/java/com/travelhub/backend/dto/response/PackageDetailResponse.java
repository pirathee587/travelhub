package com.travelhub.backend.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageDetailResponse {
    private Long id;
    private String packageName;

    private String district;
    private String packageType;
    private String startPlace;
    private String endPlace;
    private Double priceFrom;
    private Double priceTo;
    private Double basePriceAdult;
    private Double basePriceChild;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;

    private List<String> inclusions;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private Double agentRating;
    private List<ItineraryDayResponse> itinerary;
    private List<String> images;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItineraryDayResponse {
        private Integer dayNumber;
        private String title;
        private String description;
        private List<PackageActivityResponse> activities;
        private String hotelName;
        private Long hotelId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageActivityResponse {
        private String description;
        private String imageUrl;
    }
}