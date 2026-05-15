package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.infrastructure.repository.DealRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;
    private final UserService userService;
    private final AccountService accountService;
    private final TickerPairService tickerPairService;
    private final DealImageStorageService dealImageStorageService;

    public Deal createDeal(DealDto dealDto) {
        if (dealDto == null) {
            throw new IllegalArgumentException("Deal request body is required");
        }
        var userId = dealDto.getUserId();
        validateUserId(userId);

        var user = userService.getById(userId);
        var deal = new Deal(dealDto);
        deal.setTicker(tickerPairService.getByIdForUser(dealDto.getTickerPairId(), userId));
        user.addDeal(deal);

        if (dealDto.getAccountId() != null && !dealDto.getAccountId().isBlank()) {
            var account = accountService.getById(dealDto.getAccountId());
            if (account.getUser() != null && !Objects.equals(account.getUser().getId(), user.getId())) {
                throw new IllegalArgumentException("Account does not belong to user: " + dealDto.getAccountId());
            }
            account.addDeal(deal);
        } else {
            accountService.findPrimaryAccount(user).addDeal(deal);
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

    @Transactional
    public Deal addImages(String dealId, String userId, List<MultipartFile> images) {
        validateUserId(userId);
        if (images == null || images.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required");
        }

        var deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found: " + dealId));
        if (!Objects.equals(deal.getUserId(), userId)) {
            throw new IllegalArgumentException("Deal does not belong to user: " + dealId);
        }

        images.stream()
                .map(image -> dealImageStorageService.uploadDealImage(userId, dealId, image))
                .forEach(deal::addImageUrl);

        return dealRepository.save(deal);
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
    }

    public Deal update(String dealId, String userId, DealDto dealDto) {
        validateUserId(userId);
        if (dealDto == null) {
            throw new IllegalArgumentException("Deal request body is required");
        }
        var deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new IllegalArgumentException("Deal not found: " + dealId));
        if (!Objects.equals(deal.getUserId(), userId)) {
            throw new IllegalArgumentException("Deal does not belong to user: " + dealId);
        }
        deal.setTicker(tickerPairService.getByIdForUser(dealDto.getTickerPairId(), userId));
        deal.setCurrency(dealDto.getCurrency());
        deal.setRiskReward(dealDto.getRiskReward());
        deal.setOpenPrice(dealDto.getOpenPrice());
        deal.setClosePrice(dealDto.getClosePrice());
        deal.setDescription(dealDto.getDescription());
        deal.setResult(dealDto.getResult());
        deal.setDeposit(dealDto.getDeposit());

        return dealRepository.save(deal);
    }

    public void delete(String dealId) {
        dealRepository.deleteById(dealId);
    }
}
