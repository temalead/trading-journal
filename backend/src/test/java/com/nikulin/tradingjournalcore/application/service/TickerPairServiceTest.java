package com.nikulin.tradingjournalcore.application.service;

import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import com.nikulin.tradingjournalcore.infrastructure.repository.TickerPairRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.TickerPairDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TickerPairServiceTest {

    @Mock
    private TickerPairRepository repository;
    @InjectMocks
    private TickerPairService tickerPairService;

    @Test
    void saveNormalizesAndSavesNewPair() {
        when(repository.findByUserIdAndPairNameIgnoreCase("user-1", "EURUSD")).thenReturn(Optional.empty());
        when(repository.save(any(TickerPair.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var pair = tickerPairService.save(new TickerPairDto(null, " user-1 ", " eurusd ", " "));

        assertThat(pair.getUserId()).isEqualTo("user-1");
        assertThat(pair.getPairName()).isEqualTo("EURUSD");
        assertThat(pair.getIcon()).isNull();
        verify(repository).save(pair);
    }

    @Test
    void saveReturnsExistingPairWhenDuplicateExists() {
        var existing = new TickerPair("user-1", "EURUSD", null);
        when(repository.findByUserIdAndPairNameIgnoreCase("user-1", "EURUSD")).thenReturn(Optional.of(existing));

        var pair = tickerPairService.save(new TickerPairDto(null, "user-1", "eurusd", null));

        assertThat(pair).isSameAs(existing);
        verify(repository, never()).save(any());
    }

    @Test
    void getPairsValidatesUserIdAndDelegates() {
        var pair = new TickerPair("user-1", "EURUSD", null);
        when(repository.findAllByUserIdOrderByPairNameAsc("user-1")).thenReturn(List.of(pair));

        assertThat(tickerPairService.getPairs("user-1")).containsExactly(pair);
    }

    @Test
    void getByIdForUserReturnsOwnedPair() {
        var pair = new TickerPair("user-1", "EURUSD", null);
        when(repository.findById("pair-1")).thenReturn(Optional.of(pair));

        assertThat(tickerPairService.getByIdForUser("pair-1", "user-1")).isSameAs(pair);
    }

    @Test
    void getByIdForUserRejectsForeignPair() {
        var pair = new TickerPair("other-user", "EURUSD", null);
        when(repository.findById("pair-1")).thenReturn(Optional.of(pair));

        assertThatThrownBy(() -> tickerPairService.getByIdForUser("pair-1", "user-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ticker pair does not belong to user: pair-1");
    }

    @Test
    void saveRejectsBlankPairName() {
        assertThatThrownBy(() -> tickerPairService.save(new TickerPairDto(null, "user-1", " ", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Pair name is required");
    }
}
