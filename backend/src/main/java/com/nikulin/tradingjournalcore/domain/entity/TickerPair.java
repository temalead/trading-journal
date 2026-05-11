package com.nikulin.tradingjournalcore.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nikulin.tradingjournalcore.domain.entity.util.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(
        name = "ticker_pairs",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "pair_name"})
)
@NoArgsConstructor
@AllArgsConstructor
public class TickerPair extends AbstractEntity {
    @JsonIgnore
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "pair_name", nullable = false)
    private String pairName;

    private String icon;
}
