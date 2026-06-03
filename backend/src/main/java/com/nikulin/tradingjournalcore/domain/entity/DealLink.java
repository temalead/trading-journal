package com.nikulin.tradingjournalcore.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class DealLink {
    @Column(length = 255)
    private String title;

    @Column(nullable = false, length = 2048)
    private String url;
}
