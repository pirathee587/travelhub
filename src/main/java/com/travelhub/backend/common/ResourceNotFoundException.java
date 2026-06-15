package com.travelhub.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * ResourceNotFoundException is a specialized runtime exception used when a requested entity 
 * (like a User, Booking, or Hotel) cannot be found in the database.
 * It automatically maps to a 404 Not Found HTTP status.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Constructs a descriptive error message identifying the missing resource.
     * @param resourceName The name of the entity (e.g., "User").
     * @param fieldName The field used for lookup (e.g., "id").
     * @param fieldValue The value that failed to resolve.
     */
    public ResourceNotFoundException(String resourceName,
                                     String fieldName,
                                     Object fieldValue) {
        super(String.format("%s not found with %s : '%s'",
                resourceName, fieldName, fieldValue));
    }
}