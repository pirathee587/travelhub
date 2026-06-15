package com.travelhub.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * ApiResponse is a generic wrapper for all REST API responses.
 * It ensures a consistent JSON structure across the platform, facilitating easier frontend consumption.
 * @param <T> The type of the data payload being returned.
 */
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    /**
     * Primary constructor for responses containing a data payload.
     */
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Constructor for simple status/message responses without data.
     */
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    // ─── Static Factory Methods for Streamlined Response Generation ─────────────────

    /**
     * Returns a standard 200 OK success response with data.
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, message, data));
    }

    /**
     * Returns a standard 200 OK success response with only a message.
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(String message) {
        return ResponseEntity.ok(new ApiResponse<>(true, message));
    }

    /**
     * Returns a 201 Created success response.
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, message, data));
    }

    /**
     * Internal helper to construct error-state responses.
     */
    public static <T> ResponseEntity<ApiResponse<T>> error(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, message));
    }

    /**
     * Returns a 404 Not Found error response.
     */
    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return error(message, HttpStatus.NOT_FOUND);
    }

    /**
     * Returns a 400 Bad Request error response.
     */
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return error(message, HttpStatus.BAD_REQUEST);
    }

    /**
     * Returns a 401 Unauthorized error response.
     */
    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return error(message, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Returns a 500 Internal Server Error response.
     */
    public static <T> ResponseEntity<ApiResponse<T>> internalError(String message) {
        return error(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}