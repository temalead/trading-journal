package com.nikulin.tradingjournalcore.domain.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum DealSession {
    LONDON("london"),
    FRANKFURT("frankfurt"),
    ASIA("asia"),
    NEW_YORK("new york");

    private final String value;

    DealSession(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DealSession fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        var normalizedValue = value.trim().replace('_', ' ').replace('-', ' ');
        return Arrays.stream(values())
                .filter(session -> session.value.equalsIgnoreCase(normalizedValue))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown deal session: " + value));
    }
}
