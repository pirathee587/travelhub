package com.travelhub.backend.config;

import java.util.ArrayList;
import java.util.List;

/**
 * RequiredEnvVarValidator is a pre-startup safety check utility.
 * It ensures that all infrastructure-critical environment variables are defined 
 * before the application attempts to initialize its database connections.
 */
public final class RequiredEnvVarValidator {

    /**
     * Private constructor to prevent instantiation of this utility class.
     */
    private RequiredEnvVarValidator() {
    }

    /**
     * Performs a comprehensive audit of required environment variables.
     * Logic:
     * 1. Checks for mandatory DB credentials.
     * 2. Validates either a full DB_URL or individual host/port/name components.
     * @throws IllegalStateException with a descriptive message if any critical configuration is missing.
     */
    public static void validate() {
        List<String> missing = new ArrayList<>();
        // Core security credentials
        addIfMissing(missing, "DB_USERNAME");
        addIfMissing(missing, "DB_PASSWORD");

        // Infrastructure resolution logic
        String dbUrl = System.getenv("DB_URL");
        boolean hasDbUrl = dbUrl != null && !dbUrl.isBlank();
        if (!hasDbUrl) {
            // Fallback: If no direct URL is provided, individual parts must be defined
            addIfMissing(missing, "DB_HOST");
            addIfMissing(missing, "DB_PORT");
            addIfMissing(missing, "DB_NAME");
        }

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Missing required database environment variables: "
                            + String.join(", ", missing)
                            + ". Set DB_URL, or set DB_HOST/DB_PORT/DB_NAME with DB_USERNAME/DB_PASSWORD before starting the backend."
            );
        }
    }

    /**
     * Helper to verify the existence and non-blank status of a specific environment variable.
     */
    private static void addIfMissing(List<String> missing, String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            missing.add(key);
        }
    }
}
