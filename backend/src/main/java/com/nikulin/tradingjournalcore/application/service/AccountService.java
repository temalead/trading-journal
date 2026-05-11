package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    public Account getById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
    }

    public Account getOrCreatePrimaryAccount(User user) {
        return accountRepository.findFirstByUserIdOrderByCreatedAtAsc(user.getId())
                .orElseGet(() -> createDefaultAccount(user));
    }

    public Account createDefaultAccount(User user) {
        Account account = new Account();
        account.setActive(true);
        account.setDeposit(BigDecimal.ZERO);
        user.addAccount(account);
        return accountRepository.save(account);
    }
}
