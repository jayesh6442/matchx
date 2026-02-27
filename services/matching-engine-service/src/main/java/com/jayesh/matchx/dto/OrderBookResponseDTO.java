package com.jayesh.matchx.dto;

import com.jayesh.matchx.model.OrderBookEntry;
import java.util.List;

public class OrderBookResponseDTO {
    private String symbol;
    private List<OrderBookEntry> bids;
    private List<OrderBookEntry> asks;

    public OrderBookResponseDTO(String symbol, List<OrderBookEntry> bids, List<OrderBookEntry> asks) {
        this.symbol = symbol;
        this.bids = bids;
        this.asks = asks;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public List<OrderBookEntry> getBids() {
        return bids;
    }

    public void setBids(List<OrderBookEntry> bids) {
        this.bids = bids;
    }

    public List<OrderBookEntry> getAsks() {
        return asks;
    }

    public void setAsks(List<OrderBookEntry> asks) {
        this.asks = asks;
    }
}
