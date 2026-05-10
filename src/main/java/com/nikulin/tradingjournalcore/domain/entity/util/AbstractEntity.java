package com.nikulin.tradingjournalcore.domain.entity.util;

import java.time.LocalDateTime;

public abstract class AbstractEntity {
    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
