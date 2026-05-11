package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TickerPairRepository extends JpaRepository<TickerPair, String> {
    List<TickerPair> findAllByUserIdOrderByPairNameAsc(String userId);

    Optional<TickerPair> findByUserIdAndPairNameIgnoreCase(String userId, String pairName);
}
