package com.jayesh.trade.controller;

import com.jayesh.trade.model.TradeEntity;
import com.jayesh.trade.service.TradePersistenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trades")
public class TradeController {

    private final TradePersistenceService tradeService;

    public TradeController(TradePersistenceService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping
    public ResponseEntity<List<TradeEntity>> getTrades(@RequestParam(required = false) String symbol) {
        if (symbol != null && !symbol.isBlank()) {
            return ResponseEntity.ok(tradeService.getTradesBySymbol(symbol));
        }
        return ResponseEntity.ok(List.of());
    }
}
