package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.DealService;
import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.infrastructure.repository.DealRepository;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("/deal")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @PostMapping
    public ResponseEntity<Deal> create(DealDto dealdto){
        var deal = dealService.createDeal(dealdto);
        return new ResponseEntity<>(deal, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Deal>> getAll(){
        return new ResponseEntity<>(List.of(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deal> getById(@PathVariable String id){
        return new ResponseEntity<>(new Deal(), HttpStatus.OK);
    }
}
