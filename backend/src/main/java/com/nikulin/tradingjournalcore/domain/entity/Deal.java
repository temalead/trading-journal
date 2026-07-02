package com.nikulin.tradingjournalcore.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Deal extends AbstractEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticker_pair_id")
    private TickerPair ticker;
    @Column(nullable = false)
    private BigDecimal deposit;
    @Column(nullable = false)
    private String currency;
    @Column(nullable = false)
    private String riskReward;
    @Column(nullable = false)
    private LocalDate openedAt;
    private String description;
    private BigDecimal risk;
    private DealSession session;
    @Enumerated(EnumType.STRING)
    private DealResult result;

    @ElementCollection
    @CollectionTable(name = "deal_images", joinColumns = @JoinColumn(name = "deal_id"))
    @Column(name = "image_url", nullable = false, length = 1024)
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "deal_links", joinColumns = @JoinColumn(name = "deal_id"))
    @OrderColumn(name = "position")
    private List<DealLink> links = new ArrayList<>();

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
        this.session = dealDto.getSession();
        this.riskReward = dealDto.getRiskReward();
        this.openedAt = dealDto.getOpenedAt();
        this.description = dealDto.getDescription();
        this.result = dealDto.getResult();
        setLinks(dealDto.getLinks());
    }

    public void addImageUrl(String imageUrl) {
        imageUrls.add(imageUrl);
    }

    public void setLinks(List<DealLink> links) {
        this.links = links == null ? new ArrayList<>() : new ArrayList<>(links);
    }

    @Transient
    @JsonIgnore
    public String getUserId() {
        return user == null ? null : user.getId();
    }

    @Transient
    @JsonIgnore
    public String getAccountId() {
        return account == null ? null : account.getId();
    }
}
