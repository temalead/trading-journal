package com.nikulin.tradingjournalcore.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@NoArgsConstructor
public class Account extends AbstractEntity {
    private boolean active;
    private boolean isProp;
    private String propName;
    private BigDecimal propDeposit;
    private BigDecimal deposit;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "account")
    private List<Deal> deals = new ArrayList<>();

    public void addDeal(Deal deal) {
        deals.add(deal);
        deal.setAccount(this);
    }
}
