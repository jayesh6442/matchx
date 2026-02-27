export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface OrderRequest {
    symbol: string;
    side: OrderSide;
    price: number;
    quantity: number;
}

export interface OrderResponse {
    id: string;
    symbol: string;
    side: OrderSide;
    price: number;
    quantity: number;
    remainingQuantity: number;
    status: OrderStatus;
    timestamp: string;
}

export interface CancelOrderResponse {
    cancelled: boolean;
}
