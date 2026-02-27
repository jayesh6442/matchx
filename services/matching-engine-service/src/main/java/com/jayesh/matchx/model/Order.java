package com.jayesh.matchx.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Order {
    private final String id;
    private final String symbol;
    private final OrderSide side;
    private final BigDecimal price;
    private final BigDecimal quantity;
    private BigDecimal remainingQuantity;
    private final Instant timestamp;
    private OrderStatus status;

    public Order(String symbol, OrderSide side, BigDecimal price, BigDecimal quantity) {
        this.id = UUID.randomUUID().toString();
        this.symbol = symbol;
        this.side = side;
        this.price = price;
        this.quantity = quantity;
        this.remainingQuantity = quantity;
        this.timestamp = Instant.now();
        this.status = OrderStatus.OPEN;
    }

    public String getId() {
        return id;
    }

    public String getSymbol() {
        return symbol;
    }

    public OrderSide getSide() {
        return side;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(BigDecimal remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public boolean isFullyFilled() {
        return remainingQuantity.compareTo(BigDecimal.ZERO) == 0;
    }

    public boolean isOpen() {
        return status == OrderStatus.OPEN || status == OrderStatus.PARTIALLY_FILLED;
    }
}
