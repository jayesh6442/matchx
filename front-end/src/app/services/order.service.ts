import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest, OrderResponse, CancelOrderResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly baseUrl = 'http://localhost:8080/api/v1/orders';

    constructor(private http: HttpClient) { }

    submitOrder(order: OrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.baseUrl, order);
    }

    cancelOrder(orderId: string, symbol: string): Observable<CancelOrderResponse> {
        return this.http.delete<CancelOrderResponse>(`${this.baseUrl}/${orderId}`, {
            params: { symbol },
        });
    }

    getOrder(orderId: string, symbol: string): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.baseUrl}/${orderId}`, {
            params: { symbol },
        });
    }
}
