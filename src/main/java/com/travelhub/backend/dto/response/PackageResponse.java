package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponse {
    private Long id;
    private String packageName;
    private String destination;
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
    private String festivalDetails;
    private Boolean trending;
    private String agentName;
    private String district;
    private String packageType;
}