package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import com.nikulin.tradingjournalcore.domain.entity.DealResult;
import com.nikulin.tradingjournalcore.domain.entity.DealLink;
import com.nikulin.tradingjournalcore.domain.entity.DealSession;
import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class DealDto {
    private TickerPair ticker;
    private String tickerPairId;
    private BigDecimal deposit;
    private String currency;
    private String riskReward;
    private LocalDate openedAt;
    private String description;
    private LocalDateTime createdAt;
    private DealResult result;
    private DealSession session;
    private List<String> imageUrls = new ArrayList<>();
    private List<DealLink> links = new ArrayList<>();
    private String userId;
    private String accountId;
}
