package com.nikulin.tradingjournalcore.domain.entity;

import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
public class Deal extends AbstractEntity {
    private TickerPair ticker;
    private BigDecimal deposit;
    private String currency;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private String riskReward;
    private String description;
    private DealResult result;
    private String userId;
    private String accountId;

    public Deal(DealDto dealDto) {
        this.ticker = dealDto.getTicker();
        this.deposit = dealDto.getDeposit();
        this.currency = dealDto.getCurrency();
        this.openPrice = dealDto.getOpenPrice();
        this.closePrice = dealDto.getClosePrice();
        this.riskReward = dealDto.getRiskReward();
        this.description = dealDto.getDescription();
        this.result = dealDto.getResult();
        this.userId = dealDto.getUserId();
        this.accountId = dealDto.getAccountId();
    }
}
