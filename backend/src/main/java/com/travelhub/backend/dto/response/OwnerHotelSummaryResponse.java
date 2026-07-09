package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerHotelSummaryResponse {
    private int approved;
    private int pending;
    private int rejected;
    private int total;
}
