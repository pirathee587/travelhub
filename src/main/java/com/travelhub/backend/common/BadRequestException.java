package com.travelhub.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * BadRequestException is a domain-specific runtime exception used to signal invalid client requests.
 * When thrown, it is intercepted by the GlobalExceptionHandler or mapped directly to a 400 Bad Request status.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    
    /**
     * Constructs a new exception with a specific descriptive message explaining why the request failed.
     */
    public BadRequestException(String message) {
        super(message);
    }
}