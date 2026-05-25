package com.nikulin.tradingjournalcore.infrastructure.rest;

import com.nikulin.tradingjournalcore.application.service.DealService;
import com.nikulin.tradingjournalcore.domain.entity.Deal;
import com.nikulin.tradingjournalcore.infrastructure.rest.dto.DealDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/deal")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @PostMapping
    public ResponseEntity<Deal> create(@RequestBody DealDto dealDto) {
        var deal = dealService.createDeal(dealDto);
        return new ResponseEntity<>(deal, HttpStatus.CREATED);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Deal> addImages(@PathVariable String id,
                                          @RequestParam String userId,
                                          @RequestPart("images") List<MultipartFile> images) {
        return ResponseEntity.ok(dealService.addImages(id, userId, images));
    }

    @PutMapping
    public ResponseEntity<Deal> update(@RequestParam String dealId,
                                       @RequestParam String userId,
                                       @RequestBody DealDto dealDto) {
        var deal = dealService.update(dealId, userId, dealDto);
        return ResponseEntity.ok(deal);
    }

    @DeleteMapping
    public ResponseEntity<Deal> delete(@RequestParam String dealId) {
        dealService.delete(dealId);

        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Deal>> getAll(@RequestParam String userId,
                                             @RequestParam(required = false) String accountId) {
        return new ResponseEntity<>(dealService.getAllDeals(userId, accountId), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deal> getById(@PathVariable String id,
                                        @RequestParam String userId) {
        return dealService.getDealById(id)
                .filter(deal -> userId.equals(deal.getUserId()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException exception) {
        return ResponseEntity.internalServerError().body(exception.getMessage());
    }

}
