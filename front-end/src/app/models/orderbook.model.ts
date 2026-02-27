export interface OrderBookEntry {
    price: number;
    quantity: number;
}

export interface OrderBook {
    symbol: string;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}
