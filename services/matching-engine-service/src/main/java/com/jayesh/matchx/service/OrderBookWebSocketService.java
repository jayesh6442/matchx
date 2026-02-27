package com.jayesh.matchx.service;

import com.jayesh.matchx.dto.OrderBookResponseDTO;
import com.jayesh.matchx.engine.OrderBook;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderBookWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public OrderBookWebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastOrderBookUpdate(OrderBook.OrderBookSnapshot snapshot) {
        OrderBookResponseDTO response = new OrderBookResponseDTO(
            snapshot.symbol(),
            snapshot.bids(),
            snapshot.asks()
        );
        messagingTemplate.convertAndSend("/topic/orderbook/" + snapshot.symbol(), response);
    }
}
