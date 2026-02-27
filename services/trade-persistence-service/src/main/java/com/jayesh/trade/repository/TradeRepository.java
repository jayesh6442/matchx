package com.jayesh.trade.repository;

import com.jayesh.trade.model.TradeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<TradeEntity, Long> {
    List<TradeEntity> findBySymbolOrderByTimestampDesc(String symbol);
}
