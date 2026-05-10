package com.nikulin.tradingjournalcore.domain.entity;

import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;

import java.math.BigDecimal;

public class Account extends AbstractEntity {
    private boolean active;
    private boolean isProp;
    private String propName;
    private BigDecimal propDeposit;
}
