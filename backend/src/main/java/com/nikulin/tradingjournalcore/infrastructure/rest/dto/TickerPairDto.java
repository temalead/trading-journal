package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;

public record TickerPairDto(String id, String pairName, String icon) {
    public static TickerPairDto from(TickerPair tickerPair) {
        return new TickerPairDto(tickerPair.getId(), tickerPair.getPairName(), tickerPair.getIcon());
    }
}
