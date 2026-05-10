package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.infrastructure.repository.DealRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;

    public Deal createDeal(DealDto dealDto) {
        return dealRepository.save(new Deal(dealDto));
    }

}
