package com.travelhub.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    // ─── Static Factory Methods ───────────────────────────────────────────────

    public static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> ok(String message) {
        return ResponseEntity.ok(new ApiResponse<>(true, message));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, message));
    }

    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return error(message, HttpStatus.NOT_FOUND);
    }

    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return error(message, HttpStatus.BAD_REQUEST);
    }

    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return error(message, HttpStatus.UNAUTHORIZED);
    }

    public static <T> ResponseEntity<ApiResponse<T>> internalError(String message) {
        return error(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}