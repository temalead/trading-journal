package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import com.nikulin.tradingjournalcore.infrastructure.repository.TickerPairRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TickerPairService {

    private final TickerPairRepository repository;

    public TickerPair save(TickerPair tickerPair) {
        validate(tickerPair);
        normalize(tickerPair);
        return repository.findByUserIdAndPairNameIgnoreCase(tickerPair.getUserId(), tickerPair.getPairName())
                .orElseGet(() -> repository.save(tickerPair));
    }

    public List<TickerPair> getPairs(String userId) {
        validateUserId(userId);
        return repository.findAllByUserIdOrderByPairNameAsc(userId);
    }

    public TickerPair getOrCreate(String userId, TickerPair tickerPair) {
        validateUserId(userId);
        if (tickerPair == null || tickerPair.getPairName() == null || tickerPair.getPairName().isBlank()) {
            throw new IllegalArgumentException("Pair name is required");
        }

        tickerPair.setUserId(userId);
        return save(tickerPair);
    }

    private void validate(TickerPair tickerPair) {
        if (tickerPair == null) {
            throw new IllegalArgumentException("Ticker pair request body is required");
        }
        validateUserId(tickerPair.getUserId());
        if (tickerPair.getPairName() == null || tickerPair.getPairName().isBlank()) {
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
}
