package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.AccountRepository;
import com.nikulin.tradingjournalcore.infrastructure.repository.UserRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.CreateAccountDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private AccountService accountService;

    @Test
    void getByIdReturnsAccount() {
        var account = new Account();
        when(accountRepository.findById("account-1")).thenReturn(Optional.of(account));

        assertThat(accountService.getById("account-1")).isSameAs(account);
    }

    @Test
    void createDefaultAccountCreatesActiveNonPropAccount() {
        var user = user("user-1");
        when(accountRepository.save(org.mockito.ArgumentMatchers.any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var account = accountService.createDefaultAccount(user);

        assertThat(account.isActive()).isTrue();
        assertThat(account.isProp()).isFalse();
        assertThat(account.getDeposit()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(account.getUser()).isSameAs(user);
        assertThat(user.getAccounts()).contains(account);
    }

    @Test
    void findPrimaryAccountReturnsFirstNonPropAccount() {
        var user = user("user-1");
        var account = new Account();
        when(accountRepository.findByUserId("user-1", false)).thenReturn(List.of(account));

        assertThat(accountService.findPrimaryAccount(user)).isSameAs(account);
    }

    @Test
    void findPrimaryAccountThrowsWhenMissing() {
        var user = user("user-1");
        when(accountRepository.findByUserId("user-1", false)).thenReturn(List.of());

        assertThatThrownBy(() -> accountService.findPrimaryAccount(user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Primary account not found for user: user-1");
    }

    @Test
    void createAccountAttachesAccountToUserAndSaves() {
        var user = user("user-1");
        var dto = new CreateAccountDto();
        dto.setProp(true);
        dto.setPropName("FTMO");
        dto.setDeposit(BigDecimal.TEN);
        dto.setPropDeposit(BigDecimal.valueOf(100_000));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(accountRepository.save(org.mockito.ArgumentMatchers.any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var account = accountService.createAccount("user-1", dto);

        assertThat(account.isActive()).isTrue();
        assertThat(account.isProp()).isTrue();
        assertThat(account.getPropName()).isEqualTo("FTMO");
        assertThat(account.getDeposit()).isEqualByComparingTo(BigDecimal.TEN);
        assertThat(account.getPropDeposit()).isEqualByComparingTo(BigDecimal.valueOf(100_000));
        assertThat(account.getUser()).isSameAs(user);
        assertThat(user.getAccounts()).contains(account);
        verify(accountRepository).save(account);
    }

    @Test
    void findAllAccountsValidatesUserId() {
        assertThatThrownBy(() -> accountService.findAllAccounts(" "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("userId is required");
    }

    private User user(String id) {
        var user = new User();
        user.setId(id);
        return user;
    }
}
