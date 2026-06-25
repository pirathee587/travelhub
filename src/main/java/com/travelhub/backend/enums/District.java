package com.travelhub.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum District {
    AMPARA("Ampara"),
    ANURADHAPURA("Anuradhapura"),
    BADULLA("Badulla"),
    BATTICALOA("Batticaloa"),
    COLOMBO("Colombo"),
    GALLE("Galle"),
    GAMPAHA("Gampaha"),
    HAMBANTOTA("Hambantota"),
    JAFFNA("Jaffna"),
    KALUTARA("Kalutara"),
    KANDY("Kandy"),
    KEGALLE("Kegalle"),
    KILINOCHCHI("Kilinochchi"),
    KURUNEGALA("Kurunegala"),
    MANNAR("Mannar"),
    MATALE("Matale"),
    MATARA("Matara"),
    MONARAGALA("Monaragala"),
    MULLAITIVU("Mullaitivu"),
    NUWARA_ELIYA("Nuwara Eliya"),
    POLONNARUWA("Polonnaruwa"),
    PUTTALAM("Puttalam"),
    RATNAPURA("Ratnapura"),
    TRINCOMALEE("Trincomalee"),
    VAVUNIYA("Vavuniya");

    private final String displayName;

    District(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    @JsonCreator
    public static District fromString(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        for (District d : District.values()) {
            if (d.displayName.equalsIgnoreCase(text.trim())) {
                return d;
            }
        }
        throw new IllegalArgumentException("Unknown district: " + text);
    }
}
