package com.jayesh.matchx.controller;

import com.jayesh.matchx.dto.OrderRequestDTO;
import com.jayesh.matchx.dto.OrderResponseDTO;
import com.jayesh.matchx.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDTO> submitOrder(@Valid @RequestBody OrderRequestDTO request) {
        return ResponseEntity.ok(orderService.submitOrder(request).join());
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Map<String, Boolean>> cancelOrder(
            @PathVariable String orderId,
            @RequestParam String symbol) {
        Boolean result = orderService.cancelOrder(orderId, symbol).join();
        return ResponseEntity.ok(Map.of("cancelled", result));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrder(
            @PathVariable String orderId,
            @RequestParam String symbol) {
        var order = orderService.getOrder(symbol, orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(OrderResponseDTO.fromOrder(order));
    }
}
