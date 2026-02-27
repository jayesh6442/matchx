package com.jayesh.matchx.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Trade {
    private final String tradeId;
    private final String symbol;
    private final BigDecimal price;
    private final BigDecimal quantity;
    private final String buyOrderId;
    private final String sellOrderId;
    private final Instant timestamp;

    public Trade(String symbol, BigDecimal price, BigDecimal quantity, 
                 String buyOrderId, String sellOrderId) {
        this.tradeId = UUID.randomUUID().toString();
        this.symbol = symbol;
        this.price = price;
        this.quantity = quantity;
        this.buyOrderId = buyOrderId;
        this.sellOrderId = sellOrderId;
        this.timestamp = Instant.now();
    }

    public String getTradeId() {
        return tradeId;
    }

    public String getSymbol() {
        return symbol;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public String getBuyOrderId() {
        return buyOrderId;
    }

    public String getSellOrderId() {
        return sellOrderId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
