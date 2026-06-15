package com.travelhub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplateConfig initializes the primary HTTP client used for external service communication.
 * It provides a globally accessible bean for making synchronous REST calls to third-party APIs.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Exposes the RestTemplate bean to the Spring application context.
     * Useful for payment gateway verifications, SMS integrations, or other external microservice calls.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
