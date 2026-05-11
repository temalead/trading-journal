package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Account;
import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.domain.entity.User;
import com.nikulin.tradingjournalcore.infrastructure.repository.DealRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final UserService userService;
    private final AccountService accountService;

    public Deal createDeal(DealDto dealDto) {
        if (dealDto == null) {
            throw new IllegalArgumentException("Deal request body is required");
        }
        validateUserId(dealDto.getUserId());

        User user = userService.getById(dealDto.getUserId());
        Deal deal = new Deal(dealDto);
        user.addDeal(deal);

        if (dealDto.getAccountId() != null && !dealDto.getAccountId().isBlank()) {
            Account account = accountService.getById(dealDto.getAccountId());
            if (account.getUser() != null && !Objects.equals(account.getUser().getId(), user.getId())) {
                throw new IllegalArgumentException("Account does not belong to user: " + dealDto.getAccountId());
            }
            account.addDeal(deal);
        }

        return dealRepository.save(deal);
    }

    public List<Deal> getAllDeals(String userId, String accountId) {
        validateUserId(userId);
        if (accountId == null || accountId.isBlank()) {
            return dealRepository.findAllByUserId(userId);
        }

        return dealRepository.findAllByUserIdAndAccountId(userId, accountId);
    }

    public Optional<Deal> getDealById(String id) {
        return dealRepository.findById(id);
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
    }

}
