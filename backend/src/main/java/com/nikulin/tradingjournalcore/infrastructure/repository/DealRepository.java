package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, String> {

    List<Deal> findAllByUserId(String userId);

    List<Deal> findAllByUserIdAndAccountId(String userId, String accountId);

}
