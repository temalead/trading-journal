package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.domain.entity.DealLink;
import com.nikulin.tradingjournalcore.domain.entity.DealResult;
import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.DealRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock
    private DealRepository dealRepository;
    @Mock
    private UserService userService;
    @Mock
    private AccountService accountService;
    @Mock
    private TickerPairService tickerPairService;
    @Mock
    private DealImageStorageService dealImageStorageService;
    @InjectMocks
    private DealService dealService;

    @Test
    void createDealAttachesUserPairAndExplicitAccount() {
        var user = user("user-1");
        var account = account("account-1", user);
        var pair = new TickerPair("user-1", "EURUSD", null);
        var dto = dealDto();
        dto.setAccountId("account-1");
        when(userService.getById("user-1")).thenReturn(user);
        when(tickerPairService.getByIdForUser("pair-1", "user-1")).thenReturn(pair);
        when(accountService.getById("account-1")).thenReturn(account);
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var deal = dealService.createDeal(dto);

        assertThat(deal.getUser()).isSameAs(user);
        assertThat(deal.getAccount()).isSameAs(account);
        assertThat(deal.getTicker()).isSameAs(pair);
        assertThat(deal.getLinks())
                .extracting(DealLink::getTitle, DealLink::getUrl)
                .containsExactly(assertThatLink("TradingView", "https://tradingview.com/chart/1"));
        assertThat(user.getDeals()).contains(deal);
        assertThat(account.getDeals()).contains(deal);
    }

    @Test
    void createDealUsesPrimaryAccountWhenAccountIdMissing() {
        var user = user("user-1");
        var primaryAccount = account("account-1", user);
        var pair = new TickerPair("user-1", "EURUSD", null);
        var dto = dealDto();
        dto.setAccountId(null);
        when(userService.getById("user-1")).thenReturn(user);
        when(tickerPairService.getByIdForUser("pair-1", "user-1")).thenReturn(pair);
        when(accountService.findPrimaryAccount(user)).thenReturn(primaryAccount);
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var deal = dealService.createDeal(dto);

        assertThat(deal.getAccount()).isSameAs(primaryAccount);
    }

    @Test
    void createDealRejectsForeignAccount() {
        var user = user("user-1");
        var foreignUser = user("other-user");
        var account = account("account-1", foreignUser);
        var dto = dealDto();
        dto.setAccountId("account-1");
        when(userService.getById("user-1")).thenReturn(user);
        when(tickerPairService.getByIdForUser("pair-1", "user-1")).thenReturn(new TickerPair("user-1", "EURUSD", null));
        when(accountService.getById("account-1")).thenReturn(account);

        assertThatThrownBy(() -> dealService.createDeal(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Account does not belong to user: account-1");
    }

    @Test
    void getAllDealsDelegatesByUserWhenAccountIdMissing() {
        var deal = new Deal();
        when(dealRepository.findAllByUserId("user-1")).thenReturn(List.of(deal));

        assertThat(dealService.getAllDeals("user-1", null)).containsExactly(deal);
    }

    @Test
    void getAllDealsDelegatesByUserAndAccount() {
        var deal = new Deal();
        when(dealRepository.findAllByUserIdAndAccountId("user-1", "account-1")).thenReturn(List.of(deal));

        assertThat(dealService.getAllDeals("user-1", "account-1")).containsExactly(deal);
    }

    @Test
    void addImagesUploadsEachImageAndStoresUrls() {
        var user = user("user-1");
        var deal = new Deal();
        deal.setId("deal-1");
        user.addDeal(deal);
        var first = new MockMultipartFile("images", "one.png", "image/png", "1".getBytes());
        var second = new MockMultipartFile("images", "two.png", "image/png", "2".getBytes());
        when(dealRepository.findById("deal-1")).thenReturn(Optional.of(deal));
        when(dealImageStorageService.uploadDealImage("user-1", "deal-1", first)).thenReturn("url-1");
        when(dealImageStorageService.uploadDealImage("user-1", "deal-1", second)).thenReturn("url-2");
        when(dealRepository.save(deal)).thenReturn(deal);

        var saved = dealService.addImages("deal-1", "user-1", List.of(first, second));

        assertThat(saved.getImageUrls()).containsExactly("url-1", "url-2");
    }

    @Test
    void addImagesRejectsForeignDeal() {
        var owner = user("owner");
        var deal = new Deal();
        deal.setId("deal-1");
        owner.addDeal(deal);
        when(dealRepository.findById("deal-1")).thenReturn(Optional.of(deal));

        assertThatThrownBy(() -> dealService.addImages("deal-1", "user-1", List.of(new MockMultipartFile("images", "one.png", "image/png", "1".getBytes()))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Deal does not belong to user: deal-1");
    }

    @Test
    void updateRejectsForeignDeal() {
        var owner = user("owner");
        var deal = new Deal();
        deal.setId("deal-1");
        owner.addDeal(deal);
        when(dealRepository.findById("deal-1")).thenReturn(Optional.of(deal));

        assertThatThrownBy(() -> dealService.update("deal-1", "user-1", dealDto()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Deal does not belong to user: deal-1");
    }

    @Test
    void deleteDelegatesToRepository() {
        var user = user("user-1");
        var deal = new Deal();
        deal.setId("deal-1");
        user.addDeal(deal);
        when(dealRepository.findById("deal-1")).thenReturn(Optional.of(deal));

        dealService.delete("deal-1", "user-1");

        verify(dealRepository).delete(deal);
    }

    private DealDto dealDto() {
        var dto = new DealDto();
        dto.setUserId("user-1");
        dto.setTickerPairId("pair-1");
        dto.setDeposit(BigDecimal.valueOf(1000));
        dto.setCurrency("USD");
        dto.setRiskReward("2R");
        dto.setResult(DealResult.PROFIT);
        dto.setDescription("description");
        dto.setLinks(List.of(new DealLink("TradingView", "https://tradingview.com/chart/1")));
        return dto;
    }

    private static org.assertj.core.groups.Tuple assertThatLink(String title, String url) {
        return org.assertj.core.api.Assertions.tuple(title, url);
    }

    private User user(String id) {
        var user = new User();
        user.setId(id);
        return user;
    }

    private Account account(String id, User user) {
        var account = new Account();
        account.setId(id);
        user.addAccount(account);
        return account;
    }
}
