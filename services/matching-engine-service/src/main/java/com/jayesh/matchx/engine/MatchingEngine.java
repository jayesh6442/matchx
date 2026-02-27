package com.jayesh.matchx.engine;

import com.jayesh.matchx.model.Order;
import com.jayesh.matchx.model.Trade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Component
public class MatchingEngine {
    private static final Logger logger = LoggerFactory.getLogger(MatchingEngine.class);
    
    private final Map<String, OrderBook> orderBooks = new ConcurrentHashMap<>();
    private final Map<String, ExecutorService> symbolExecutors = new ConcurrentHashMap<>();
    
    private final TradeCallback tradeCallback;
    
    public MatchingEngine(TradeCallback tradeCallback) {
        this.tradeCallback = tradeCallback;
    }

    private ExecutorService getExecutorForSymbol(String symbol) {
        return symbolExecutors.computeIfAbsent(symbol, s -> {
            logger.info("Creating new executor for symbol: {}", symbol);
            return Executors.newSingleThreadExecutor(r -> {
                Thread t = new Thread(r, "matching-engine-" + symbol);
                t.setDaemon(true);
                return t;
            });
        });
    }

    public OrderBook getOrderBook(String symbol) {
        return orderBooks.computeIfAbsent(symbol, OrderBook::new);
    }

    public CompletableFuture<List<Trade>> submitOrder(Order order) {
        return CompletableFuture.supplyAsync(() -> {
            logger.info("Processing order: {} {} {} @ {} for {}",
                order.getId(), order.getSide(), order.getQuantity(), order.getPrice(), order.getSymbol());
            
            OrderBook orderBook = getOrderBook(order.getSymbol());
            List<Trade> trades = orderBook.match(order);
            
            if (!trades.isEmpty()) {
                logger.info("Generated {} trades for order {}", trades.size(), order.getId());
                for (Trade trade : trades) {
                    tradeCallback.onTrade(trade);
                }
            }
            
            return trades;
        }, getExecutorForSymbol(order.getSymbol()));
    }

    public CompletableFuture<Boolean> cancelOrder(String orderId, String symbol) {
        return CompletableFuture.supplyAsync(() -> {
            OrderBook orderBook = getOrderBook(symbol);
            return orderBook.cancelOrder(orderId);
        }, getExecutorForSymbol(symbol));
    }

    public OrderBook.OrderBookSnapshot getOrderBookSnapshot(String symbol) {
        OrderBook orderBook = orderBooks.get(symbol);
        if (orderBook == null) {
            return new OrderBook.OrderBookSnapshot(symbol, List.of(), List.of());
        }
        return orderBook.getSnapshot();
    }

    public Order getOrder(String symbol, String orderId) {
        OrderBook orderBook = orderBooks.get(symbol);
        if (orderBook == null) {
            return null;
        }
        return orderBook.getOrder(orderId);
    }

    @FunctionalInterface
    public interface TradeCallback {
        void onTrade(Trade trade);
    }
}
