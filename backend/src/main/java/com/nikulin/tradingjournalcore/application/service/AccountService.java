package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.AccountRepository;
import com.nikulin.tradingjournalcore.infrastructure.repository.UserRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.CreateAccountDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public Account getById(String id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
    }

    public Account createDefaultAccount(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User is required");
        }
        var account = new Account();
        account.setActive(true);
        account.setProp(false);
        account.setDeposit(BigDecimal.ZERO);
        user.addAccount(account);
        return accountRepository.save(account);
    }

    public List<Account> findAllAccounts(String userId) {
        validateUserId(userId);
        return accountRepository.findByUserId(userId);
    }

    public Account findPrimaryAccount(User user) {
        if (user == null || user.getId() == null || user.getId().isBlank()) {
            throw new IllegalArgumentException("User is required");
        }
        return accountRepository.findByUserId(user.getId(), false).stream().findAny()
                .orElseThrow(() -> new IllegalArgumentException("Primary account not found for user: " + user.getId()));
    }

    public List<Account> findPropAccounts(String userId) {
        validateUserId(userId);
        return accountRepository.findByUserId(userId, true);
    }

    public Account createAccount(String userId, CreateAccountDto accountDto) {
        validateUserId(userId);
        if (accountDto == null) {
            throw new IllegalArgumentException("Account request body is required");
        }
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        var account = new Account();
        account.setActive(true);
        account.setProp(accountDto.isProp());
        account.setDeposit(accountDto.getDeposit());
        account.setPropDeposit(accountDto.getPropDeposit());
        account.setPropName(accountDto.getPropName());
        user.addAccount(account);

        return accountRepository.save(account);
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
    }
}
