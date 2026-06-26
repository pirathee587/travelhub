package com.travelhub.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OwnerSessionResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    private Boolean isActive;
    private Boolean isApproved;
    private boolean accessGranted;
    private String message;
}
