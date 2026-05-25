package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import java.util.Set;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(String username, String email, String password) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String userId,
                               String accountId,
                               String username,
                               String email,
                               Set<String> roles,
                               String accessToken,
                               String tokenType,
                               long expiresInSeconds) {
    }
}
