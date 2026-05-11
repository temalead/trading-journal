package com.nikulin.tradingjournalcore.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Deal extends AbstractEntity {
    @Embedded
    private TickerPair ticker;
    private BigDecimal deposit;
    private String currency;
    private BigDecimal openPrice;
    private BigDecimal closePrice;
    private String riskReward;
    private String description;

    @Enumerated(EnumType.STRING)
    private DealResult result;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    public Deal(DealDto dealDto) {
        this.ticker = dealDto.getTicker();
        this.deposit = dealDto.getDeposit();
        this.currency = dealDto.getCurrency();
        this.openPrice = dealDto.getOpenPrice();
        this.closePrice = dealDto.getClosePrice();
        this.riskReward = dealDto.getRiskReward();
        this.description = dealDto.getDescription();
        this.result = dealDto.getResult();
    }

    @Transient
    public String getUserId() {
        return user == null ? null : user.getId();
    }

    @Transient
    public String getAccountId() {
        return account == null ? null : account.getId();
    }
}
