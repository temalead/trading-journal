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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TickerPairServiceTest {

    public static final String USER_ID = "user-1";
    @Mock
    private TickerPairRepository repository;
    @InjectMocks
    private TickerPairService tickerPairService;

    @Test
    void saveNormalizesAndSavesNewPair() {
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "EURUSD")).thenReturn(Optional.empty());
        when(repository.save(any(TickerPair.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var pair = tickerPairService.save(new TickerPairDto(null, " user-1 ", " eurusd ", " "));

        assertThat(pair.getUserId()).isEqualTo(USER_ID);
        assertThat(pair.getPairName()).isEqualTo("EURUSD");
        assertThat(pair.getIcon()).isNull();
        verify(repository).save(pair);
    }

    @Test
    void saveReturnsExistingPairWhenDuplicateExists() {
        var existing = new TickerPair(USER_ID, "EURUSD", null);
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "EURUSD")).thenReturn(Optional.of(existing));

        var pair = tickerPairService.save(new TickerPairDto(null, USER_ID, "eurusd", null));

        assertThat(pair).isSameAs(existing);
        verify(repository, never()).save(any());
    }

    @Test
    void getPairsValidatesUserIdAndDelegates() {
        var pair = new TickerPair(USER_ID, "EURUSD", null);
        defaultPairsExist();
        when(repository.findAllByUserIdOrderByPairNameAsc(USER_ID)).thenReturn(List.of(pair));

        assertThat(tickerPairService.getPairs(USER_ID)).containsExactly(pair);
        verify(repository, never()).save(any());
    }

    @Test
    void getPairsCreatesMissingDefaultPairs() {
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "EURUSD")).thenReturn(Optional.empty());
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "GBPUSD")).thenReturn(Optional.empty());
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "US30")).thenReturn(Optional.empty());
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "GER40")).thenReturn(Optional.empty());
        when(repository.save(any(TickerPair.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(repository.findAllByUserIdOrderByPairNameAsc(USER_ID)).thenReturn(List.of(
                new TickerPair(USER_ID, "EURUSD", "EU"),
                new TickerPair(USER_ID, "GBPUSD", "GB"),
                new TickerPair(USER_ID, "US30", "US"),
                new TickerPair(USER_ID, "GER40", "DE")
        ));

        var pairs = tickerPairService.getPairs(" user-1 ");

        assertThat(pairs)
                .extracting(TickerPair::getPairName)
                .containsExactly("EURUSD", "GBPUSD", "US30", "GER40");
        verify(repository, times(4)).save(any(TickerPair.class));
    }

    @Test
    void getByIdForUserReturnsOwnedPair() {
        var pair = new TickerPair(USER_ID, "EURUSD", null);
        when(repository.findById("pair-1")).thenReturn(Optional.of(pair));

        assertThat(tickerPairService.getByIdForUser("pair-1", USER_ID)).isSameAs(pair);
    }

    @Test
    void getByIdForUserRejectsForeignPair() {
        var pair = new TickerPair("other-user", "EURUSD", null);
        when(repository.findById("pair-1")).thenReturn(Optional.of(pair));

        assertThatThrownBy(() -> tickerPairService.getByIdForUser("pair-1", USER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Ticker pair does not belong to user: pair-1");
    }

    @Test
    void saveRejectsBlankPairName() {
        assertThatThrownBy(() -> tickerPairService.save(new TickerPairDto(null, USER_ID, " ", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Pair name is required");
    }

    private void defaultPairsExist() {
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "EURUSD"))
                .thenReturn(Optional.of(new TickerPair(USER_ID, "EURUSD", "EU")));
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "GBPUSD"))
                .thenReturn(Optional.of(new TickerPair(USER_ID, "GBPUSD", "GB")));
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "US30"))
                .thenReturn(Optional.of(new TickerPair(USER_ID, "US30", "US")));
        when(repository.findByUserIdAndPairNameIgnoreCase(USER_ID, "GER40"))
                .thenReturn(Optional.of(new TickerPair(USER_ID, "GER40", "DE")));
    }
}
