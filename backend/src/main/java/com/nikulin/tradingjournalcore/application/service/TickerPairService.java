package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import com.nikulin.tradingjournalcore.infrastructure.repository.TickerPairRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.TickerPairDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TickerPairService {
    private static final List<DefaultPair> DEFAULT_PAIRS = List.of(
            new DefaultPair("EURUSD", "EU"),
            new DefaultPair("GBPUSD", "GB"),
            new DefaultPair("US30", "US"),
            new DefaultPair("GER40", "DE")
    );

    private final TickerPairRepository repository;

    public TickerPair save(TickerPairDto pair) {
        validate(pair);
        var tickerPair = TickerPairDto.to(pair);

        normalize(tickerPair);
        return repository.findByUserIdAndPairNameIgnoreCase(tickerPair.getUserId(), tickerPair.getPairName())
                .orElseGet(() -> repository.save(tickerPair));
    }

    public List<TickerPair> getPairs(String userId) {
        validateUserId(userId);
        var normalizedUserId = userId.trim();
        ensureDefaultPairs(normalizedUserId);
        return repository.findAllByUserIdOrderByPairNameAsc(normalizedUserId);
    }

    public TickerPair getByIdForUser(String pairId, String userId) {
        validateUserId(userId);
        if (pairId == null || pairId.isBlank()) {
            throw new IllegalArgumentException("tickerPairId is required");
        }

        var pair = repository.findById(pairId)
                .orElseThrow(() -> new IllegalArgumentException("Ticker pair not found: " + pairId));
        if (!Objects.equals(pair.getUserId(), userId)) {
            throw new IllegalArgumentException("Ticker pair does not belong to user: " + pairId);
        }

        return pair;
    }

    private void validate(TickerPairDto tickerPair) {
        if (tickerPair == null) {
            throw new IllegalArgumentException("Ticker pair request body is required");
        }
        validateUserId(tickerPair.userId());
        if (tickerPair.pairName() == null || tickerPair.pairName().isBlank()) {
            throw new IllegalArgumentException("Pair name is required");
        }
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
    }

    private void normalize(TickerPair tickerPair) {
        tickerPair.setUserId(tickerPair.getUserId().trim());
        tickerPair.setPairName(tickerPair.getPairName().trim().toUpperCase());
        if (tickerPair.getIcon() != null && tickerPair.getIcon().isBlank()) {
            tickerPair.setIcon(null);
        }
    }

    private void ensureDefaultPairs(String userId) {
        DEFAULT_PAIRS.forEach(defaultPair ->
                repository.findByUserIdAndPairNameIgnoreCase(userId, defaultPair.pairName())
                        .orElseGet(() -> repository.save(new TickerPair(userId, defaultPair.pairName(), defaultPair.icon())))
        );
    }

    private record DefaultPair(String pairName, String icon) {
    }
}
