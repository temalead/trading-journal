package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import com.nikulin.tradingjournalcore.domain.entity.DealResult;
import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DealDto {
    private TickerPair ticker;
    private BigDecimal deposit;
    private String currency;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private String riskReward;
    private String description;
    private LocalDateTime createdAt;
    private DealResult result;
    private String userId;
    private String accountId;
}
