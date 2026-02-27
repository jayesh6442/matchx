package com.jayesh.matchx.engine;

import com.jayesh.matchx.model.Order;
import com.jayesh.matchx.model.OrderBookEntry;
import com.jayesh.matchx.model.OrderSide;
import com.jayesh.matchx.model.OrderStatus;
import com.jayesh.matchx.model.Trade;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class OrderBook {
    private final String symbol;
    
    private final TreeMap<BigDecimal, Queue<Order>> bids = new TreeMap<>(Comparator.reverseOrder());
    private final TreeMap<BigDecimal, Queue<Order>> asks = new TreeMap<>();
    
    private final Map<String, Order> ordersById = new ConcurrentHashMap<>();

    public OrderBook(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }

    public synchronized void addOrder(Order order) {
        ordersById.put(order.getId(), order);
        
        TreeMap<BigDecimal, Queue<Order>> book = order.getSide() == OrderSide.BUY ? bids : asks;
        Map<BigDecimal, Queue<Order>> otherSide = order.getSide() == OrderSide.BUY ? asks : bids;
        
        book.computeIfAbsent(order.getPrice(), k -> new ConcurrentLinkedQueue<>()).add(order);
    }

    public synchronized List<Trade> match(Order incomingOrder) {
        List<Trade> trades = new ArrayList<>();
        
        TreeMap<BigDecimal, Queue<Order>> oppositeSide = incomingOrder.getSide() == OrderSide.BUY ? asks : bids;
        
        while (incomingOrder.isOpen() && !oppositeSide.isEmpty()) {
            BigDecimal bestPrice = incomingOrder.getSide() == OrderSide.BUY 
                ? oppositeSide.firstKey() 
                : oppositeSide.lastKey();
            
            boolean canMatch = incomingOrder.getSide() == OrderSide.BUY 
                ? incomingOrder.getPrice().compareTo(bestPrice) >= 0
                : incomingOrder.getPrice().compareTo(bestPrice) <= 0;
            
            if (!canMatch) {
                break;
            }
            
            Queue<Order> priceLevel = oppositeSide.get(bestPrice);
            if (priceLevel == null || priceLevel.isEmpty()) {
                oppositeSide.remove(bestPrice);
                continue;
            }
            
            Order restingOrder = priceLevel.peek();
            if (restingOrder == null || !restingOrder.isOpen()) {
                priceLevel.poll();
                continue;
            }
            
            BigDecimal tradeQuantity = incomingOrder.getRemainingQuantity().min(restingOrder.getRemainingQuantity());
            
            String buyOrderId = incomingOrder.getSide() == OrderSide.BUY ? incomingOrder.getId() : restingOrder.getId();
            String sellOrderId = incomingOrder.getSide() == OrderSide.SELL ? incomingOrder.getId() : restingOrder.getId();
            
            Trade trade = new Trade(symbol, bestPrice, tradeQuantity, buyOrderId, sellOrderId);
            trades.add(trade);
            
            incomingOrder.setRemainingQuantity(incomingOrder.getRemainingQuantity().subtract(tradeQuantity));
            restingOrder.setRemainingQuantity(restingOrder.getRemainingQuantity().subtract(tradeQuantity));
            
            if (restingOrder.isFullyFilled()) {
                restingOrder.setStatus(OrderStatus.FILLED);
                priceLevel.poll();
            } else {
                restingOrder.setStatus(OrderStatus.PARTIALLY_FILLED);
            }
            
            if (incomingOrder.isFullyFilled()) {
                incomingOrder.setStatus(OrderStatus.FILLED);
            } else if (incomingOrder.getStatus() == OrderStatus.OPEN) {
                incomingOrder.setStatus(OrderStatus.PARTIALLY_FILLED);
            }
        }
        
        if (incomingOrder.isOpen()) {
            addOrder(incomingOrder);
        }
        
        return trades;
    }

    public synchronized boolean cancelOrder(String orderId) {
        Order order = ordersById.get(orderId);
        if (order == null || !order.isOpen()) {
            return false;
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        
        TreeMap<BigDecimal, Queue<Order>> book = order.getSide() == OrderSide.BUY ? bids : asks;
        Queue<Order> priceLevel = book.get(order.getPrice());
        if (priceLevel != null) {
            priceLevel.remove(order);
            if (priceLevel.isEmpty()) {
                book.remove(order.getPrice());
            }
        }
        
        return true;
    }

    public synchronized Order getOrder(String orderId) {
        return ordersById.get(orderId);
    }

    public synchronized OrderBookSnapshot getSnapshot() {
        List<OrderBookEntry> bidEntries = new ArrayList<>();
        List<OrderBookEntry> askEntries = new ArrayList<>();
        
        for (Map.Entry<BigDecimal, Queue<Order>> entry : bids.entrySet()) {
            BigDecimal totalQty = entry.getValue().stream()
                .filter(Order::isOpen)
                .map(Order::getRemainingQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
                bidEntries.add(new OrderBookEntry(entry.getKey(), totalQty));
            }
        }
        
        for (Map.Entry<BigDecimal, Queue<Order>> entry : asks.entrySet()) {
            BigDecimal totalQty = entry.getValue().stream()
                .filter(Order::isOpen)
                .map(Order::getRemainingQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (totalQty.compareTo(BigDecimal.ZERO) > 0) {
                askEntries.add(new OrderBookEntry(entry.getKey(), totalQty));
            }
        }
        
        return new OrderBookSnapshot(symbol, bidEntries, askEntries);
    }

    public record OrderBookSnapshot(String symbol, List<OrderBookEntry> bids, List<OrderBookEntry> asks) {}
}
