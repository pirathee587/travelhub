package com.travelhub.backend.dto.response;

import java.time.LocalDateTime;

public record RecentActivityResponse(
        String title,
        String desc,
        String status,
        LocalDateTime timestamp,
        String icon,
        String color
) {}
