package com.nikulin.tradingjournalcore.infrastructure.rest.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAccountDto {
    private boolean active;
    private boolean isProp;
    private String propName;
    private BigDecimal propDeposit;
    private BigDecimal deposit;
}
