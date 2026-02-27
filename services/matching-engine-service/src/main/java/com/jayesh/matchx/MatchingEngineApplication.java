package com.jayesh.matchx;

import com.jayesh.matchx.engine.MatchingEngine;
import com.jayesh.matchx.service.OrderBookWebSocketService;
import com.jayesh.matchx.service.TradePublisherService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MatchingEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(MatchingEngineApplication.class, args);
    }

    @Bean
    public MatchingEngine matchingEngine(TradePublisherService tradePublisherService, 
                                         OrderBookWebSocketService webSocketService) {
        return new MatchingEngine(trade -> {
            try {
                tradePublisherService.publishTrade(trade);
                var snapshot = tradePublisherService.getOrderBookSnapshot(trade.getSymbol());
                if (snapshot != null) {
                    webSocketService.broadcastOrderBookUpdate(snapshot);
                }
            } catch (Exception e) {
                System.err.println("Error publishing trade: " + e.getMessage());
            }
        });
    }
}
