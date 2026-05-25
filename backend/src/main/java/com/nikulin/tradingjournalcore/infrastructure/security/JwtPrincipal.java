package com.nikulin.tradingjournalcore.infrastructure.security;

import java.util.Set;

public record JwtPrincipal(
        String userId,
        String email,
        String username,
        Set<String> roles
) {
}
