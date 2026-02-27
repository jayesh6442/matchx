package com.jayesh.trade.service;

import com.jayesh.trade.model.TradeEntity;
import com.jayesh.trade.repository.TradeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TradePersistenceService {
    private static final Logger logger = LoggerFactory.getLogger(TradePersistenceService.class);

    private final TradeRepository tradeRepository;

    public TradePersistenceService(TradeRepository tradeRepository) {
        this.tradeRepository = tradeRepository;
    }

    @Transactional
    public TradeEntity saveTrade(TradeEntity trade) {
        TradeEntity saved = tradeRepository.save(trade);
        logger.info("Saved trade: {} for symbol {}", saved.getId(), saved.getSymbol());
        return saved;
    }

    public List<TradeEntity> getTradesBySymbol(String symbol) {
        return tradeRepository.findBySymbolOrderByTimestampDesc(symbol);
    }
}
