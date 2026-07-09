package com.travelhub.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdatePackageStatusRequest {

    @NotNull(message = "isActive is required")
    private Boolean isActive;
}