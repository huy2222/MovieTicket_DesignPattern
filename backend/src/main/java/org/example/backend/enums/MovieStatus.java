package org.example.backend.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MovieStatus {
    COMING_SOON,
    NOW_SHOWING,
    ENDED;

    @JsonCreator
    public static MovieStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace(' ', '_');
        try {
            return switch (normalized) {
                case "STOPPED", "ENDED" -> ENDED;
                case "UPCOMING", "FEATURED" -> COMING_SOON;
                default -> MovieStatus.valueOf(normalized);
            };
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Trạng thái phim không hợp lệ. Chọn một trong: COMING_SOON, NOW_SHOWING, ENDED"
            );
        }
    }

    @JsonValue
    public String toJson() {
        return name();
    }
}
