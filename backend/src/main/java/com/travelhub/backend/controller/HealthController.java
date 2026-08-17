package com.travelhub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    @GetMapping({"/api/health", "/health", "/"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "TravelHub Backend API",
                "timestamp", Instant.now().toString()
        ));
    }
}
