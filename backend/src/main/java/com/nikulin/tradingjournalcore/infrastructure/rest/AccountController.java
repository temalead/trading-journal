package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.AccountService;
import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.CreateAccountDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<Account> create(@RequestParam String userId, @RequestBody CreateAccountDto createAccountDto) {
        var account = accountService.createAccount(userId, createAccountDto);
        return ResponseEntity.ok().body(account);
    }

    @GetMapping
    public List<Account> findAllAccountsByUserId(@RequestParam String userId) {
        return accountService.findAllAccounts(userId);
    }

    @GetMapping("/props")
    public List<Account> getAllPropAccounts(@RequestParam String userId) {
        return accountService.findPropAccounts(userId);
    }
}
