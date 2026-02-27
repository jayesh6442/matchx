package com.jayesh.matchx.model;

import java.math.BigDecimal;

public class OrderBookEntry {
    private final BigDecimal price;
    private final BigDecimal quantity;

    public OrderBookEntry(BigDecimal price, BigDecimal quantity) {
        this.price = price;
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }
}
