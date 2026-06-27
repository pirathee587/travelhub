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
<<<<<<< HEAD
    /** users.status — PENDING, ACTIVE, DEACTIVATED */
    private String status;
    /** users.is_active */
    private Boolean isActive;
    /** true when status is ACTIVE */
    private Boolean isApproved;
    /** true when role is HOTEL_OWNER, approved, and active */
    private Boolean accessGranted;
=======
    private String status;
    private Boolean isActive;
    private Boolean isApproved;
    private boolean accessGranted;
>>>>>>> develop
    private String message;
}
