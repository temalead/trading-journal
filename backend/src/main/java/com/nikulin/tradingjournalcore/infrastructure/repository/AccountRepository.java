package com.nikulin.tradingjournalcore.infrastructure.repository;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findFirstByUserIdOrderByCreatedAtAsc(String userId);
}
