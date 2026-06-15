package com.travelhub.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * UnauthorizedException is a specialized runtime exception used to signal authentication failures 
 * or lack of sufficient permissions for a requested operation.
 * It automatically maps to a 401 Unauthorized HTTP status.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {
    
    /**
     * Constructs a new exception with a specific security-related message.
     */
    public UnauthorizedException(String message) {
        super(message);
    }
}
