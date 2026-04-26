package com.travelhub.backend.config;

import java.util.ArrayList;
import java.util.List;

public final class RequiredEnvVarValidator {

    private RequiredEnvVarValidator() {
    }

    public static void validate() {
        List<String> missing = new ArrayList<>();
        addIfMissing(missing, "DB_USERNAME");
        addIfMissing(missing, "DB_PASSWORD");

        String dbUrl = System.getenv("DB_URL");
        boolean hasDbUrl = dbUrl != null && !dbUrl.isBlank();
        if (!hasDbUrl) {
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

    private static void addIfMissing(List<String> missing, String key) {
        String value = System.getenv(key);
        if (value == null || value.isBlank()) {
            missing.add(key);
        }
    }
}
