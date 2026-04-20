package com.travelhub.backend.config;

import java.util.ArrayList;
import java.util.List;

public final class RequiredEnvVarValidator {

    private RequiredEnvVarValidator() {
    }

    public static void validate() {
        List<String> missing = new ArrayList<>();
        addIfMissing(missing, "DB_URL");
        addIfMissing(missing, "DB_USERNAME");
        addIfMissing(missing, "DB_PASSWORD");

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Missing required database environment variables: "
                            + String.join(", ", missing)
                            + ". Set these env vars before starting the backend."
            );
        }
    }

    private static void addIfMissing(List<String> missing, String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            missing.add(key);
        }
    }
}
