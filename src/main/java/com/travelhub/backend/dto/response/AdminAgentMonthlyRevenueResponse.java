package com.travelhub.backend.dto.response;

import java.util.List;

public record AdminAgentMonthlyRevenueResponse(
        String       period,   // Daily/Weekly/Monthly/Yearly
        List<String> labels,   // J,F,M,A,M,J,J,A,S,O,N,D
        List<Double> data      // Revenue values
) {}
