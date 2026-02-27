package com.jayesh.matchx.service;

import com.jayesh.matchx.engine.MatchingEngine;
import com.jayesh.matchx.engine.OrderBook;
import com.jayesh.matchx.model.Order;
import com.jayesh.matchx.model.OrderSide;
import com.jayesh.matchx.model.Trade;
import com.jayesh.matchx.dto.OrderRequestDTO;
import com.jayesh.matchx.dto.OrderResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class OrderService {

    private final MatchingEngine matchingEngine;
    private final TradePublisherService tradePublisherService;

    public OrderService(MatchingEngine matchingEngine, TradePublisherService tradePublisherService) {
        this.matchingEngine = matchingEngine;
        this.tradePublisherService = tradePublisherService;
    }

    public CompletableFuture<OrderResponseDTO> submitOrder(OrderRequestDTO request) {
        Order order = new Order(
            request.getSymbol(),
            request.getSide(),
            request.getPrice(),
            request.getQuantity()
        );

        return matchingEngine.submitOrder(order)
            .thenApply(trades -> {
                tradePublisherService.publishTrades(trades);
                return OrderResponseDTO.fromOrder(order);
            });
    }

    public CompletableFuture<Boolean> cancelOrder(String orderId, String symbol) {
        return matchingEngine.cancelOrder(orderId, symbol);
    }

    public Order getOrder(String symbol, String orderId) {
        return matchingEngine.getOrder(symbol, orderId);
    }

    public OrderBook.OrderBookSnapshot getOrderBookSnapshot(String symbol) {
        return matchingEngine.getOrderBookSnapshot(symbol);
    }
}
