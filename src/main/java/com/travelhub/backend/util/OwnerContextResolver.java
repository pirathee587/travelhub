package com.travelhub.backend.util;

import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;

/**
 * Resolves the current hotel-owner user id.
 * Dev/testing: X-Owner-Id header. Production: JWT userId claim.
 */
@Component
public class OwnerContextResolver {

    public Long resolveOwnerId(Long devOwnerId) {
        if (devOwnerId != null) {
            return devOwnerId;
        }

        Claims claims = SecurityUtils.getCurrentUserClaims();
        if (claims != null && claims.get("userId") != null) {
            return Long.valueOf(claims.get("userId").toString());
        }

        return null;
    }
}
