package com.travelhub.backend.common;


import com.travelhub.backend.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── ResourceNotFoundException ─────────────────────────────
    // எல்லோரும் பயன்படுத்தலாம்
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(
            ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse(false, ex.getMessage()));
    }

    // ── BadRequestException ───────────────────────────────────
    // எல்லோரும் பயன்படுத்தலாம்
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse> handleBadRequest(
            BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, ex.getMessage()));
    }

    // ── UnauthorizedException ─────────────────────────────────
    // எல்லோரும் பயன்படுத்தலாம்
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorized(
            UnauthorizedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, ex.getMessage()));
    }

    // ── Validation Exception ──────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(
            MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .toList();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, "Validation failed: " + errors));
    }

    // ── General Exception ─────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneral(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false, "An unexpected error occurred: " + ex.getMessage()));
    }

    // ══════════════════════════════════════════════════════════
    // TODO — மற்றவர்கள் Exception வேண்டும் என்றால்
    // Piratheepan-க்கு சொல்லி இங்கே சேர்க்கவும்
    //
    // உதாரணம்:
    // @ExceptionHandler(HotelNotFoundException.class)
    // public ResponseEntity<ApiResponse> handleHotelNotFound(
    //                      HotelNotFoundException ex) {
    //     return ResponseEntity.status(404)
    //         .body(new ApiResponse(false, ex.getMessage()));
    // }
    // ══════════════════════════════════════════════════════════
}