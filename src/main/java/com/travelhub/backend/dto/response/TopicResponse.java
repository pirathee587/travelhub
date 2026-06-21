package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TopicResponse {
    private String category;
    private Double averageRating;
    private List<PackageResponse> packages;
}
