package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    @Query("select a from Account a where a.user.id = :userId and a.isProp = :prop")
    List<Account> findByUserId(@Param("userId") String userId, @Param("prop") boolean prop);

    @Query("select a from Account a where a.user.id = :userId")
    List<Account> findByUserId(String userId);
}
