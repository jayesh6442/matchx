export interface Trade {
    id: number;
    symbol: string;
    price: number;
    quantity: number;
    buyOrderId: string;
    sellOrderId: string;
    timestamp: string;
}
