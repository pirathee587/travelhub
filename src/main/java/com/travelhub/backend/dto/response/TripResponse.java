package com.travelhub.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private Long packageId;
    private Long hotelId;
    private String packageName;

    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer progress;
    private String imageUrl;
    private Double price;
    private String category;
    private String hotelName;
    private String startPlace;
    private String endPlace;
    private Double rating;
    private Long reviewCount;
}