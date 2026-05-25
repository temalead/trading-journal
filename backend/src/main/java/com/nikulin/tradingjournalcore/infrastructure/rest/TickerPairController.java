package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.TickerPairService;
import com.nikulin.tradingjournalcore.domain.entity.TickerPair;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.TickerPairDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pair")
@RequiredArgsConstructor
public class TickerPairController {
    private final TickerPairService tickerPairService;

    @PostMapping
    public ResponseEntity<TickerPairDto> save(@RequestBody TickerPairDto tickerPairDto) {
        TickerPairDto pair = TickerPairDto.from(tickerPairService.save(tickerPairDto));
        return ResponseEntity.status(HttpStatus.CREATED).body(pair);
    }

    @GetMapping
    public ResponseEntity<List<TickerPairDto>> findAll(@RequestParam String userId) {
        return ResponseEntity.ok(tickerPairService.getPairs(userId).stream().map(TickerPairDto::from).toList());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

}
