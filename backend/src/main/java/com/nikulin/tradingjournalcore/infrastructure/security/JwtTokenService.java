package com.nikulin.tradingjournalcore.infrastructure.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nikulin.tradingjournalcore.domain.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class JwtTokenService {
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final byte[] secret;
    private final long expiresInSeconds;

    public JwtTokenService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expires-in-seconds}") long expiresInSeconds
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("JWT secret must contain at least 32 characters");
        }
        this.objectMapper = new ObjectMapper();
        this.clock = Clock.systemUTC();
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expiresInSeconds = expiresInSeconds;
    }

    public String createToken(User user) {
        var now = Instant.now(clock);
        var header = Map.of(
                "alg", "HS256",
                "typ", "JWT"
        );
        var payload = new LinkedHashMap<String, Object>();
        payload.put("sub", user.getId());
        payload.put("email", user.getEmail());
        payload.put("username", user.getUsername());
        payload.put("roles", user.getRoles().stream().map(Enum::name).toList());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(expiresInSeconds).getEpochSecond());

        var unsignedToken = encodeJson(header) + "." + encodeJson(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public Optional<JwtPrincipal> parse(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }

        var parts = token.split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        var unsignedToken = parts[0] + "." + parts[1];
        if (!MessageDigest.isEqual(sign(unsignedToken).getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))) {
            return Optional.empty();
        }

        try {
            Map<String, Object> payload = objectMapper.readValue(BASE64_URL_DECODER.decode(parts[1]), MAP_TYPE);
            if (isExpired(payload)) {
                return Optional.empty();
            }

            var userId = stringClaim(payload, "sub");
            var email = stringClaim(payload, "email");
            var username = stringClaim(payload, "username");
            if (userId == null || email == null || username == null) {
                return Optional.empty();
            }

            return Optional.of(new JwtPrincipal(userId, email, username, rolesClaim(payload)));
        } catch (RuntimeException | IOException exception) {
            return Optional.empty();
        }
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    private boolean isExpired(Map<String, Object> payload) {
        var exp = payload.get("exp");
        if (!(exp instanceof Number number)) {
            return true;
        }
        return Instant.now(clock).getEpochSecond() >= number.longValue();
    }

    private String stringClaim(Map<String, Object> payload, String name) {
        var value = payload.get(name);
        return value instanceof String string && !string.isBlank() ? string : null;
    }

    private Set<String> rolesClaim(Map<String, Object> payload) {
        var roles = payload.get("roles");
        if (!(roles instanceof List<?> list)) {
            return Set.of();
        }

        var result = new LinkedHashSet<String>();
        for (Object role : list) {
            if (role instanceof String string && !string.isBlank()) {
                result.add(string);
            }
        }
        return result;
    }

    private String encodeJson(Object value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to create JWT", exception);
        }
    }

    private String sign(String value) {
        try {
            var mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign JWT", exception);
        }
    }
}
