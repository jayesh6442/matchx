package com.jayesh.matchx.dto;

import com.jayesh.matchx.model.Order;
import com.jayesh.matchx.model.OrderSide;
import com.jayesh.matchx.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;

public class OrderResponseDTO {
    private String id;
    private String symbol;
    private OrderSide side;
    private BigDecimal price;
    private BigDecimal quantity;
    private BigDecimal remainingQuantity;
    private OrderStatus status;
    private Instant timestamp;

    public static OrderResponseDTO fromOrder(Order order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setSymbol(order.getSymbol());
        dto.setSide(order.getSide());
        dto.setPrice(order.getPrice());
        dto.setQuantity(order.getQuantity());
        dto.setRemainingQuantity(order.getRemainingQuantity());
        dto.setStatus(order.getStatus());
        dto.setTimestamp(order.getTimestamp());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public OrderSide getSide() {
        return side;
    }

    public void setSide(OrderSide side) {
        this.side = side;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(BigDecimal remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
