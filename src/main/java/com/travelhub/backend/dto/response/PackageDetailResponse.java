package com.travelhub.backend.dto.response;

import com.travelhub.backend.enums.District;

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
    private String destination;
    private District district;
    private String startPlace;
    private String endPlace;
    private Double priceFrom;
    private Double priceTo;
    private String duration;
    private String category;
    private String imageUrl;
    private Double rating;
    private Integer reviewCount;
    private String festivalDetails;
    private Boolean trending;
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
        private List<String> activities;
    }
}