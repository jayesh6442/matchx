package com.jayesh.matchx.service;

import com.jayesh.matchx.model.Trade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class TradePublisherService {
    private static final Logger logger = LoggerFactory.getLogger(TradePublisherService.class);
    private static final String TOPIC = "trade-events";

    private final KafkaTemplate<String, Trade> kafkaTemplate;

    public TradePublisherService(KafkaTemplate<String, Trade> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishTrade(Trade trade) {
        try {
            logger.info("Publishing trade: {} for {}", trade.getTradeId(), trade.getSymbol());
            CompletableFuture<SendResult<String, Trade>> future = 
                kafkaTemplate.send(TOPIC, trade.getSymbol(), trade);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    logger.error("Failed to publish trade: {}", trade.getTradeId(), ex);
                } else {
                    logger.debug("Trade published successfully: {}", trade.getTradeId());
                }
            });
        } catch (Exception e) {
            logger.error("Error publishing trade: {}", trade.getTradeId(), e);
        }
    }

    public void publishTrades(List<Trade> trades) {
        trades.forEach(this::publishTrade);
    }
}
