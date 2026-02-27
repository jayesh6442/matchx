package com.jayesh.trade.consumer;

import com.jayesh.trade.model.TradeEntity;
import com.jayesh.trade.service.TradePersistenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Component
public class TradeConsumer {
    private static final Logger logger = LoggerFactory.getLogger(TradeConsumer.class);

    private final TradePersistenceService persistenceService;

    public TradeConsumer(TradePersistenceService persistenceService) {
        this.persistenceService = persistenceService;
    }

    @KafkaListener(topics = "trade-events", groupId = "trade-persistence-group")
    public void consume(Map<String, Object> message) {
        logger.info("Received trade event: {}", message);

        try {
            TradeEntity entity = new TradeEntity();
            entity.setSymbol((String) message.get("symbol"));
            entity.setPrice(new BigDecimal(message.get("price").toString()));
            entity.setQuantity(new BigDecimal(message.get("quantity").toString()));
            entity.setBuyOrderId((String) message.get("buyOrderId"));
            entity.setSellOrderId((String) message.get("sellOrderId"));
            
            Object timestamp = message.get("timestamp");
            if (timestamp != null) {
                if (timestamp instanceof Number) {
                    entity.setTimestamp(Instant.ofEpochSecond(((Number) timestamp).longValue()));
                } else {
                    entity.setTimestamp(Instant.parse((String) timestamp));
                }
            } else {
                entity.setTimestamp(Instant.now());
            }

            persistenceService.saveTrade(entity);
            logger.info("Trade saved: {}", entity.getSymbol());
        } catch (Exception e) {
            logger.error("Error processing trade: {}", e.getMessage(), e);
        }
    }
}
