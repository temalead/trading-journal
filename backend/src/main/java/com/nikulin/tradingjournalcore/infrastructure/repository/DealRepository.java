package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, String> {

    @Query("select d from Deal d where d.user.id = :userId")
    List<Deal> findAllByUserId(String userId);

    @Query("select d from Deal d where d.user.id = :userId and d.account.id = :accountId")
    List<Deal> findAllByUserIdAndAccountId(String userId, String accountId);

}
