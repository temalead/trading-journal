package com.nikulin.tradingjournalcore.application.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordServiceTest {

    private final PasswordService passwordService = new PasswordService();

    @Test
    void hashMatchesOriginalPassword() {
        var hash = passwordService.hash("secret-password");

        assertThat(passwordService.matches("secret-password", hash)).isTrue();
        assertThat(passwordService.matches("wrong-password", hash)).isFalse();
    }

    @Test
    void hashUsesRandomSalt() {
        var first = passwordService.hash("secret-password");
        var second = passwordService.hash("secret-password");

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void matchesRejectsInvalidInput() {
        assertThat(passwordService.matches(null, "hash")).isFalse();
        assertThat(passwordService.matches("password", null)).isFalse();
        assertThat(passwordService.matches("password", "bad-format")).isFalse();
    }
}
