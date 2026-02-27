package com.jayesh.matchx.controller;

import com.jayesh.matchx.dto.OrderBookResponseDTO;
import com.jayesh.matchx.engine.OrderBook;
import com.jayesh.matchx.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orderbook")
public class OrderBookController {

    private final OrderService orderService;

    public OrderBookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<OrderBookResponseDTO> getOrderBook(@RequestParam String symbol) {
        OrderBook.OrderBookSnapshot snapshot = orderService.getOrderBookSnapshot(symbol);
        return ResponseEntity.ok(new OrderBookResponseDTO(
            snapshot.symbol(),
            snapshot.bids(),
            snapshot.asks()
        ));
    }
}
