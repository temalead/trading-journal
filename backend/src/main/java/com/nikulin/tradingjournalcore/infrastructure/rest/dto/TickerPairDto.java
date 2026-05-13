package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;

public record TickerPairDto(String id, String userId, String pairName, String icon) {
    public static TickerPairDto from(TickerPair tickerPair) {
        return new TickerPairDto(
                tickerPair.getId(),
                tickerPair.getUserId(),
                tickerPair.getPairName(),
                tickerPair.getIcon()
        );
    }

    public static TickerPair to(TickerPairDto tickerPair) {
        return new TickerPair(tickerPair.userId(), tickerPair.pairName(), tickerPair.icon());
    }
}
